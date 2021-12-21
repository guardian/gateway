import { Request } from 'express';
import deepmerge from 'deepmerge';

import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { checkPasswordTokenController } from '@/server/controllers/checkPasswordToken';
import { setPasswordController } from '@/server/controllers/changePassword';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { typedRouter as router } from '@/server/lib/typedRoutes';
import handleRecaptcha from '@/server/lib/recaptcha';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { sendResetPasswordEmail } from '@/server/lib/idapi/resetPassword';
import { setEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import { logger } from '@/server/lib/logger';
import { ApiError } from '@/server/models/Error';
import { ResetPasswordErrors } from '@/shared/model/Errors';
import { trackMetric } from '@/server/lib/trackMetric';
import { emailSendMetric } from '@/server/models/Metrics';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';

router.get('/reset-password', (req: Request, res: ResponseWithRequestState) => {
  let state = res.locals;
  const email = readEmailCookie(req);

  if (email) {
    state = deepmerge(state, {
      pageData: {
        email,
      },
    });
  }

  const html = renderer('/reset-password', {
    requestState: state,
    pageTitle: 'Reset Password',
  });
  res.type('html').send(html);
});

router.post(
  '/reset-password',
  handleRecaptcha,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const { email = '' } = req.body;

    const { returnUrl, emailSentSuccess, ref, refViewId } =
      res.locals.queryParams;

    try {
      await sendResetPasswordEmail(email, req.ip, returnUrl, ref, refViewId);

      setEncryptedStateCookie(res, { email });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      const { message, status } =
        error instanceof ApiError
          ? error
          : new ApiError({ message: ResetPasswordErrors.GENERIC });

      trackMetric(emailSendMetric('ResetPassword', 'Failure'));

      state = deepmerge(state, {
        globalMessage: {
          error: message,
        },
      });

      const html = renderer('/reset-password', {
        requestState: state,
        pageTitle: 'Reset Password',
      });
      return res.status(status).type('html').send(html);
    }

    trackMetric(emailSendMetric('ResetPassword', 'Success'));

    return res.redirect(
      303,
      addQueryParamsToPath(
        '/reset-password/email-sent',
        res.locals.queryParams,
        {
          emailSentSuccess,
        },
      ),
    );
  }),
);

router.get(
  '/reset-password/email-sent',
  (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const email = readEmailCookie(req);

    state = deepmerge(state, {
      pageData: {
        email,
        previousPage: '/reset-password',
      },
    });

    const html = renderer('/reset-password/email-sent', {
      pageTitle: 'Check Your Inbox',
      requestState: state,
    });
    res.type('html').send(html);
  },
);

router.get(
  '/reset-password/complete',
  (req: Request, res: ResponseWithRequestState) => {
    const email = readEmailCookie(req);

    const html = renderer('/reset-password/complete', {
      requestState: deepmerge(res.locals, {
        pageData: {
          email,
        },
      }),
      pageTitle: 'Password Changed',
    });
    return res.type('html').send(html);
  },
);

router.get(
  '/reset-password/resend',
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer('/reset-password/resend', {
      pageTitle: 'Resend Change Password Email',
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

router.get(
  '/reset-password/expired',
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer('/reset-password/expired', {
      pageTitle: 'Resend Change Password Email',
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

// The below routes must be defined below the other /reset-password/* routes otherwise the other routes will fail
router.get(
  '/reset-password/:token',
  checkPasswordTokenController('/reset-password', 'Change Password'),
);

router.post(
  '/reset-password/:token',
  setPasswordController(
    '/reset-password',
    'Change Password',
    '/reset-password/complete',
  ),
);

export default router.router;
