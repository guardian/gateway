import { checkPasswordTokenController } from '@/server/controllers/checkPasswordToken';
import { setPasswordController } from '@/server/controllers/changePassword';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { sendAccountVerificationEmail } from '@/server/lib/idapi/user';
import { logger } from '@/server/lib/serverSideLogger';
import handleRecaptcha from '@/server/lib/recaptcha';
import { renderer } from '@/server/lib/renderer';
import { ApiError } from '@/server/models/Error';
import { buildUrl } from '@/shared/lib/routeUtils';
import { ResponseWithRequestState } from '@/server/models/Express';
import { consentPages } from '@/server/routes/consents';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import deepmerge from 'deepmerge';
import { Request, Router } from 'express';
import { setEncryptedStateCookie } from '../lib/encryptedStateCookie';
import { resendRegistrationEmail } from '@/server/lib/okta/register';
import { trackMetric } from '@/server/lib/trackMetric';
import { OktaError } from '@/server/models/okta/Error';
import { GenericErrors } from '@/shared/model/Errors';
import { getConfiguration } from '@/server/lib/getConfiguration';

const { okta } = getConfiguration();

const router = Router();
// resend account verification page
router.get('/welcome/resend', (_: Request, res: ResponseWithRequestState) => {
  const html = renderer('/welcome/resend', {
    pageTitle: 'Resend Welcome Email',
    requestState: res.locals,
  });
  res.type('html').send(html);
});

// resend account verification page, session expired
router.get('/welcome/expired', (_: Request, res: ResponseWithRequestState) => {
  const html = renderer('/welcome/expired', {
    pageTitle: 'Resend Welcome Email',
    requestState: res.locals,
  });
  res.type('html').send(html);
});

// POST form handler to resend account verification email
router.post(
  '/welcome/resend',
  handleRecaptcha,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { useOkta } = res.locals.queryParams;
    if (okta.enabled && useOkta) {
      await OktaResendEmail(req, res);
    } else {
      const { email } = req.body;
      const state = res.locals;
      const { returnUrl, emailSentSuccess, ref, refViewId, clientId } =
        state.queryParams;

      try {
        await sendAccountVerificationEmail(
          email,
          req.ip,
          returnUrl,
          ref,
          refViewId,
          clientId,
          state.ophanConfig,
        );

        setEncryptedStateCookie(res, { email });

        return res.redirect(
          303,
          addQueryParamsToPath('/welcome/email-sent', res.locals.queryParams, {
            emailSentSuccess,
          }),
        );
      } catch (error) {
        const { message, status } =
          error instanceof ApiError ? error : new ApiError();

        logger.error(`${req.method} ${req.originalUrl}  Error`, error);

        const html = renderer('/welcome/resend', {
          pageTitle: 'Resend Welcome Email',
          requestState: deepmerge(res.locals, {
            globalMessage: {
              error: message,
            },
          }),
        });
        return res.status(status).type('html').send(html);
      }
    }
  }),
);

// email sent page
router.get(
  '/welcome/email-sent',
  (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const email = readEmailCookie(req);

    state = deepmerge(state, {
      pageData: {
        email,
        previousPage: buildUrl('/welcome/resend'),
      },
    });

    const html = renderer('/welcome/email-sent', {
      pageTitle: 'Check Your Inbox',
      requestState: state,
    });
    res.type('html').send(html);
  },
);

// welcome page, check token and display set password page
router.get(
  '/welcome/:token',
  checkPasswordTokenController('/welcome', 'Welcome'),
);

// POST form handler to set password on welcome page
router.post(
  '/welcome/:token',
  setPasswordController('/welcome', 'Welcome', consentPages[0].path),
);

const OktaResendEmail = async (req: Request, res: ResponseWithRequestState) => {
  try {
    const { email } = req.body;

    if (typeof email !== 'undefined') {
      await resendRegistrationEmail(email);
      trackMetric('OktaWelcomeResendEmail::Success');
      return res.redirect(
        303,
        addQueryParamsToPath('/welcome/email-sent', res.locals.queryParams, {
          emailSentSuccess: true,
        }),
      );
    } else
      throw new OktaError({
        message: 'Could not resend welcome email as email was undefined',
      });
  } catch (error) {
    logger.error('Okta Registration resend email failure', error);

    trackMetric('OktaWelcomeResendEmail::Failure');

    return res.type('html').send(
      renderer('/welcome/email-sent', {
        pageTitle: 'Check Your Inbox',
        requestState: deepmerge(res.locals, {
          globalMessage: {
            error: GenericErrors.DEFAULT,
          },
        }),
      }),
    );
  }
};

export default router;
