import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { sendResetPasswordEmail } from '@/server/lib/idapi/resetPassword';
import { setEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import {
  OphanConfig,
  sendOphanInteractionEventServer,
} from '@/server/lib/ophan';
import { trackMetric } from '@/server/lib/trackMetric';
import { emailSendMetric } from '@/server/models/Metrics';
import {
  addQueryParamsToPath,
  getPersistableQueryParams,
} from '@/shared/lib/queryParams';
import { logger } from '@/server/lib/serverSideLogger';
import { ApiError } from '@/server/models/Error';
import { GenericErrors } from '@/shared/model/Errors';
import { renderer } from '@/server/lib/renderer';
import deepmerge from 'deepmerge';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { sendForgotPasswordEmail } from '@/server/lib/okta/api/authentication';

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
    await sendResetPasswordEmail(email, req.ip, returnUrl, ref, refViewId);

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

const sendEmailInOkta = async (req: Request, res: ResponseWithRequestState) => {
  const state = res.locals;
  const { email = '' } = req.body;

  try {
    await sendForgotPasswordEmail(email);

    setEncryptedStateCookie(res, {
      email,
      // We set queryParams here to allow state to be persisted as part of the registration flow,
      // because we are unable to pass these query parameters via the email activation link in Okta email templates
      queryParams: getPersistableQueryParams(res.locals.queryParams),
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
