import { Request } from 'express';
import { Routes } from '@/shared/model/Routes';
import deepmerge from 'deepmerge';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { getBrowserNameFromUserAgent } from '@/server/lib/getBrowserName';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import {
  RequestState,
  ResponseWithRequestState,
} from '@/server/models/Express';
import {
  validate as validateToken,
  change as changePassword,
} from '@/server/lib/idapi/changePassword';
import { FieldError } from '@/shared/model/ClientState';
import { ChangePasswordErrors } from '@/shared/model/Errors';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { trackMetric } from '@/server/lib/trackMetric';
import {
  readEncryptedStateCookie,
  setEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { ApiError } from '@/server/models/Error';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { ActivationResponse } from '@/server/models/Okta';
import { validateOktaActivationToken } from '@/server/lib/okta/activateUser';

const validatePasswordField = (password: string): Array<FieldError> => {
  const errors: Array<FieldError> = [];

  if (!password) {
    errors.push({
      field: 'password',
      message: ChangePasswordErrors.PASSWORD_BLANK,
    });
  } else if (password.length < 8 || password.length > 72) {
    errors.push({
      field: 'password',
      message: ChangePasswordErrors.PASSWORD_LENGTH,
    });
  }

  return errors;
};

const validateOktaTokenAndAddToState = async (
  token: string,
  req: Request,
  res: ResponseWithRequestState,
  state: RequestState,
): Promise<RequestState> => {
  // validate okta activation token and exchange it for a state token (used to set a password)
  const response: ActivationResponse = await validateOktaActivationToken({
    token,
  });
  const {
    expiresAt,
    stateToken: oktaStateToken,
    _embedded: {
      user: {
        profile: { login: email },
      },
    },
  } = response;
  const tokenExpiryTimestamp = Date.parse(expiresAt);
  setEncryptedStateCookie(res, {
    email,
    oktaStateToken,
  });
  return deepmerge(state, {
    pageData: {
      browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
      email,
      tokenExpiryTimestamp,
    },
  });
};

export const checkResetPasswordTokenController = (
  setPasswordPagePath: string,
  setPasswordPageTitle: string,
  resendEmailPagePath: string,
  resendEmailPageTitle: string,
) =>
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { okta } = getConfiguration();
    let state = res.locals;
    const { token } = req.params;

    try {
      if (okta.registrationEnabled && setPasswordPagePath === Routes.WELCOME) {
        state = await validateOktaTokenAndAddToState(token, req, res, state);
      } else {
        const { email, tokenExpiryTimestamp } = await validateToken(
          token,
          req.ip,
        );

        state = deepmerge(state, {
          pageData: {
            browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
            email,
            tokenExpiryTimestamp,
          },
        });

        // set the encrypted state here, so we can read the email
        // on the confirmation page
        setEncryptedStateCookie(res, { email });
      }

      const html = renderer(`${setPasswordPagePath}/${token}`, {
        requestState: state,
        pageTitle: setPasswordPageTitle,
      });
      return res.type('html').send(html);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      if (setPasswordPagePath === Routes.WELCOME) {
        const { email, passwordSetOnWelcomePage } =
          readEncryptedStateCookie(req) ?? {};
        if (passwordSetOnWelcomePage) {
          state = deepmerge(state, {
            pageData: {
              email,
            },
          });
          return res.type('html').send(
            renderer(`${resendEmailPagePath}${Routes.COMPLETE}`, {
              requestState: state,
              pageTitle: resendEmailPageTitle,
            }),
          );
        }
      }
      return res.type('html').send(
        renderer(`${resendEmailPagePath}${Routes.RESEND}`, {
          requestState: state,
          pageTitle: resendEmailPageTitle,
        }),
      );
    }
  });

export const setPasswordTokenController = (
  setPasswordPath: string,
  setPasswordPageTitle: string,
  resendEmailPagePath: string,
  resendEmailPageTitle: string,
  successCallback: (res: ResponseWithRequestState) => void,
) =>
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const { token } = req.params;
    const { password } = req.body;

    state = deepmerge(state, {
      pageData: {
        browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
      },
    });

    try {
      const fieldErrors = validatePasswordField(password);

      if (fieldErrors.length) {
        const { email, tokenExpiryTimestamp } = await validateToken(
          token,
          req.ip,
        );

        state = deepmerge(state, {
          pageData: {
            email,
            tokenExpiryTimestamp,
            fieldErrors,
          },
        });
        const html = renderer(`${setPasswordPath}/${token}`, {
          requestState: state,
          pageTitle: setPasswordPageTitle,
        });
        return res.status(422).type('html').send(html);
      }

      const cookies = await changePassword(password, token, req.ip);

      setIDAPICookies(res, cookies);

      // if the user navigates back to the welcome page after they have set a password, this
      // ensures we show them a custom error page rather than the link expired page
      if (setPasswordPath === Routes.WELCOME) {
        const currentState = readEncryptedStateCookie(req);
        setEncryptedStateCookie(res, {
          ...currentState,
          passwordSetOnWelcomePage: true,
        });
      }

      // we need to track both of these cloudwatch metrics as two
      // separate metrics at this point as the changePassword endpoint
      // does two things
      // a) account verification
      // b) change password
      // since these could happen at different points in time, it's best
      // to keep them as two seperate metrics
      trackMetric('AccountVerification::Success');
      trackMetric('UpdatePassword::Success');

      return successCallback(res);
    } catch (error) {
      const { message, status, field } =
        error instanceof ApiError ? error : new ApiError();

      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      // see the comment above around the success metrics
      trackMetric('AccountVerification::Failure');
      trackMetric('UpdatePassword::Failure');

      // we unfortunately need this inner try catch block to catch
      // errors from the `validateToken` method were it to fail
      try {
        const { email, tokenExpiryTimestamp } = await validateToken(
          token,
          req.ip,
        );

        if (field) {
          state = deepmerge(state, {
            pageData: {
              email,
              tokenExpiryTimestamp,
              fieldErrors: [
                {
                  field,
                  message,
                },
              ],
            },
          });
        } else {
          state = deepmerge(state, {
            pageData: {
              email,
              tokenExpiryTimestamp,
            },
            globalMessage: {
              error: message,
            },
          });
        }

        const html = renderer(`${setPasswordPath}/${token}`, {
          requestState: state,
          pageTitle: setPasswordPageTitle,
        });
        return res.status(status).type('html').send(html);
      } catch (error) {
        logger.error(`${req.method} ${req.originalUrl}  Error`, error);
        // if theres an error with the token validation, we have to take them back
        // to the resend page
        return res.type('html').send(
          renderer(`${resendEmailPagePath}${Routes.RESEND}`, {
            requestState: state,
            pageTitle: resendEmailPageTitle,
          }),
        );
      }
    }
  });
