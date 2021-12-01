import { Request, Router } from 'express';
import deepmerge from 'deepmerge';
import { ResponseWithRequestState } from '@/server/models/Express';

import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { PageTitle } from '@/shared/model/PageTitle';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { consentPages } from '@/server/routes/consents';
import { sendAccountVerificationEmail } from '@/server/lib/idapi/user';
import {
  checkResetPasswordTokenController,
  setPasswordTokenController,
} from '@/server/controllers/changePassword';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { setEncryptedStateCookie } from '../lib/encryptedStateCookie';
import { ApiError } from '@/server/models/Error';
import { buildUrl } from '@/shared/lib/routeUtils';

const router = Router();

// resend account verification page
router.get('/welcome/resend', (_: Request, res: ResponseWithRequestState) => {
  const html = renderer('/welcome/resend', {
    pageTitle: PageTitle.WELCOME_RESEND,
    requestState: res.locals,
  });
  res.type('html').send(html);
});

// resend account verification page, session expired
router.get('/welcome/expired', (_: Request, res: ResponseWithRequestState) => {
  const html = renderer('/welcome/expired', {
    pageTitle: PageTitle.WELCOME_RESEND,
    requestState: res.locals,
  });
  res.type('html').send(html);
});

// POST form handler to resend account verification email
router.post(
  '/welcome/resend',
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { email } = req.body;
    const { returnUrl, emailSentSuccess } = res.locals.queryParams;

    try {
      await sendAccountVerificationEmail(email, req.ip, returnUrl);

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
        pageTitle: PageTitle.WELCOME_RESEND,
        requestState: deepmerge(res.locals, {
          globalMessage: {
            error: message,
          },
        }),
      });
      return res.status(status).type('html').send(html);
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
      pageTitle: PageTitle.EMAIL_SENT,
      requestState: state,
    });
    res.type('html').send(html);
  },
);

// welcome page, check token and display set password page
router.get(
  '/welcome/:token',
  checkResetPasswordTokenController(
    '/welcome',
    PageTitle.WELCOME,
    '/welcome',
    PageTitle.WELCOME,
  ),
);

// POST form handler to set password on welcome page
router.post(
  '/welcome/:token',
  setPasswordTokenController(
    '/welcome',
    PageTitle.WELCOME,
    '/welcome',
    PageTitle.WELCOME,
    (res) => {
      return res.redirect(
        303,
        addQueryParamsToPath(`${consentPages[0].path}`, res.locals.queryParams),
      );
    },
  ),
);

export default router;
