import crypto from 'crypto';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { sendResetPasswordEmail as sendResetPasswordEmailIDAPI } from '@/server/lib/idapi/resetPassword';
import { setEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import {
  OphanConfig,
  sendOphanInteractionEventServer,
} from '@/server/lib/ophan';
import { trackMetric } from '@/server/lib/trackMetric';
import { emailSendMetric } from '@/server/models/Metrics';
import {
  addQueryParamsToPath,
  getPersistableQueryParamsWithoutOktaParams,
} from '@/shared/lib/queryParams';
import { logger } from '@/server/lib/serverSideLogger';
import { ApiError } from '@/server/models/Error';
import { GenericErrors } from '@/shared/model/Errors';
import { renderer } from '@/server/lib/renderer';
import deepmerge from 'deepmerge';
import { getConfiguration } from '@/server/lib/getConfiguration';
import {
  sendForgotPasswordEmail,
  validateRecoveryToken,
  resetPassword as authenticationResetPassword,
} from '@/server/lib/okta/api/authentication';
import { isOktaError } from '@/server/lib/okta/api/errors';
import {
  getUser,
  dangerouslyResetPassword,
  activateUser,
  reactivateUser,
} from '@/server/lib/okta/api/users';
import { Status } from '@/server/models/okta/User';
import { OktaError } from '@/server/models/okta/Error';
import { sendCreatePasswordEmail } from '@/email/templates/CreatePassword/sendCreatePasswordEmail';
import { sendResetPasswordEmail } from '@/email/templates/ResetPassword/sendResetPasswordEmail';

const { okta } = getConfiguration();

const sendOphanEvent = (ophanConfig: OphanConfig) => {
  sendOphanInteractionEventServer(
    {
      component: 'email-send',
      value: 'reset-password',
    },
    ophanConfig,
  );
};

const sendEmailInIDAPI = async (
  req: Request,
  res: ResponseWithRequestState,
) => {
  const state = res.locals;
  const { email = '' } = req.body;

  const { returnUrl, emailSentSuccess, ref, refViewId } = state.queryParams;

  try {
    await sendResetPasswordEmailIDAPI(email, req.ip, returnUrl, ref, refViewId);

    setEncryptedStateCookie(res, { email });

    sendOphanEvent(state.ophanConfig);

    trackMetric(emailSendMetric('ResetPassword', 'Success'));

    return res.redirect(
      303,
      addQueryParamsToPath('/reset-password/email-sent', state.queryParams, {
        emailSentSuccess,
      }),
    );
  } catch (error) {
    logger.error(`${req.method} ${req.originalUrl}  Error`, error);

    const { message, status } =
      error instanceof ApiError ? error : new ApiError();

    trackMetric(emailSendMetric('ResetPassword', 'Failure'));

    const html = renderer('/reset-password', {
      pageTitle: 'Reset Password',
      requestState: deepmerge(state, {
        globalMessage: {
          error: message,
        },
      }),
    });

    return res.status(status).type('html').send(html);
  }
};

const sendEmailInOkta = async (
  req: Request,
  res: ResponseWithRequestState,
): Promise<void | ResponseWithRequestState> => {
  const state = res.locals;
  const { email = '' } = req.body;

  try {
    // get the user object to check user status
    const user = await getUser(email);

    switch (user.status) {
      case Status.ACTIVE:
        // inner try-catch block to handle specific errors from sendForgotPasswordEmail
        try {
          // attempt to send a reset password email
          await sendForgotPasswordEmail(email);
        } catch (error) {
          // we need to catch an error here to check if the user
          // does not have a password set, for example for social users
          // we still want to send a reset password email for these users
          // so we have to check for the correct error response
          // set an placeholder unknown password and then send the email
          if (
            isOktaError(error) &&
            error.status === 403 &&
            error.code === 'E0000006'
          ) {
            // a user *should* only hit this error if no password set
            // but we do a few checks to make sure that it's the case

            // check for user does not have a password set
            // (to make sure we don't override any existing password)
            if (!user.credentials.password) {
              // generate an recoveryToken OTT and put user into RECOVERY state
              // this is the only way to create a password for a SOCIAL user who doesn't have one
              const recoveryToken = await dangerouslyResetPassword(user.id);

              // validate the token
              const { stateToken } = await validateRecoveryToken({
                recoveryToken,
              });

              // check state token is defined
              if (stateToken) {
                // set the placeholder password as a cryptographically secure UUID
                await authenticationResetPassword({
                  stateToken,
                  newPassword: crypto.randomUUID(),
                });

                // now that the placeholder password has been set, the user behaves like a
                // normal user (provider = OKTA) and we can send the email by calling this method again
                return sendEmailInOkta(req, res);
              }
            }
          }

          // otherwise throw the error to the outer catch block
          // as it's not handled in the if statement above
          throw error;
        }
        break;
      case Status.STAGED:
        {
          // if the user is STAGED, we need to activate them before we can send them an email
          // this will put them into the PROVISIONED state
          // we will send them a create password email
          const tokenResponse = await activateUser(user.id, false);
          if (!tokenResponse?.token.length) {
            throw new OktaError({
              message: `Okta user activation failed: missing activation token`,
            });
          }
          const emailIsSent = await sendCreatePasswordEmail({
            to: user.profile.email,
            setPasswordToken: tokenResponse.token,
          });
          if (!emailIsSent) {
            throw new OktaError({
              message: `Okta user activation failed: Failed to send email`,
            });
          }
        }
        break;
      case Status.PROVISIONED:
        {
          // if the user is PROVISIONED, we need to reactivate them before we can send them an email
          // this will keep them in the PROVISIONED state
          // we will send them a create password email
          const tokenResponse = await reactivateUser(user.id, false);
          if (!tokenResponse?.token.length) {
            throw new OktaError({
              message: `Okta user reactivation failed: missing re-activation token`,
            });
          }
          const emailIsSent = await sendCreatePasswordEmail({
            to: user.profile.email,
            setPasswordToken: tokenResponse.token,
          });
          if (!emailIsSent) {
            throw new OktaError({
              message: `Okta user reactivation failed: Failed to send email`,
            });
          }
        }
        break;
      case Status.RECOVERY:
      case Status.PASSWORD_EXPIRED:
        {
          // if the user is RECOVERY or PASSWORD_EXPIRED, we use the
          // dangerouslyResetPassword method to put them into the RECOVERY state
          // and send them a reset password email
          const token = await dangerouslyResetPassword(user.id);
          if (!token) {
            throw new OktaError({
              message: `Okta user reset password failed: missing reset password token`,
            });
          }
          const emailIsSent = await sendResetPasswordEmail({
            to: user.profile.email,
            resetPasswordToken: token,
          });
          if (!emailIsSent) {
            throw new OktaError({
              message: `Okta user reset password failed: Failed to send email`,
            });
          }
        }
        break;
      default:
        throw new OktaError({
          message: `Okta reset password failed with unaccepted Okta user status: ${user.status}`,
        });
    }

    setEncryptedStateCookie(res, {
      email,
      // We set queryParams here to allow state to be persisted as part of the registration flow,
      // because we are unable to pass these query parameters via the email activation link in Okta email templates
      queryParams: getPersistableQueryParamsWithoutOktaParams(
        res.locals.queryParams,
      ),
    });

    sendOphanEvent(state.ophanConfig);

    trackMetric(emailSendMetric('OktaResetPassword', 'Success'));

    return res.redirect(
      303,
      addQueryParamsToPath('/reset-password/email-sent', state.queryParams, {
        emailSentSuccess: true,
      }),
    );
  } catch (error) {
    logger.error('Okta send reset password email failed', error);

    trackMetric(emailSendMetric('OktaResetPassword', 'Failure'));

    const html = renderer('/reset-password', {
      pageTitle: 'Reset Password',
      requestState: deepmerge(state, {
        globalMessage: {
          error: GenericErrors.DEFAULT,
        },
      }),
    });

    return res.type('html').send(html);
  }
};

export const sendChangePasswordEmailController = () =>
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { useOkta } = res.locals.queryParams;
    if (okta.enabled && useOkta) {
      await sendEmailInOkta(req, res);
    } else {
      await sendEmailInIDAPI(req, res);
    }
  });
