import { Request, Router } from 'express';
import deepmerge from 'deepmerge';
import { ResponseWithRequestState } from '@/server/models/Express';
import { Routes } from '@/shared/model/Routes';
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

const router = Router();

// resend account verification page
router.get(
  `${Routes.WELCOME}${Routes.RESEND}`,
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer(`${Routes.WELCOME}${Routes.RESEND}`, {
      pageTitle: PageTitle.WELCOME_RESEND,
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

// resend account verification page, session expired
router.get(
  `${Routes.WELCOME}${Routes.EXPIRED}`,
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer(`${Routes.WELCOME}${Routes.EXPIRED}`, {
      pageTitle: PageTitle.WELCOME_RESEND,
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

// POST form handler to resend account verification email
router.post(
  `${Routes.WELCOME}${Routes.RESEND}`,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { email } = req.body;
    const { returnUrl, emailSentPage } = res.locals.queryParams;

    try {
      await sendAccountVerificationEmail(email, req.ip, returnUrl);

      setEncryptedStateCookie(res, { email });

      return res.redirect(
        303,
        addQueryParamsToPath(
          `${Routes.WELCOME}${Routes.EMAIL_SENT}`,
          res.locals.queryParams,
          { emailSentPage },
        ),
      );
    } catch (error) {
      const { message, status } =
        error instanceof ApiError ? error : new ApiError();

      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      const html = renderer(`${Routes.WELCOME}${Routes.RESEND}`, {
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
  `${Routes.WELCOME}${Routes.EMAIL_SENT}`,
  (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const email = readEmailCookie(req);

    state = deepmerge(state, {
      pageData: {
        email,
        previousPage: `${Routes.WELCOME}${Routes.RESEND}`,
      },
    });

    const html = renderer(`${Routes.WELCOME}${Routes.EMAIL_SENT}`, {
      pageTitle: PageTitle.EMAIL_SENT,
      requestState: state,
    });
    res.type('html').send(html);
  },
);

// welcome page, check token and display set password page
router.get(
  `${Routes.WELCOME}${Routes.TOKEN_PARAM}`,
  checkResetPasswordTokenController(
    Routes.WELCOME,
    PageTitle.WELCOME,
    Routes.WELCOME,
    PageTitle.WELCOME,
  ),
);

// POST form handler to set password on welcome page
router.post(
  `${Routes.WELCOME}${Routes.TOKEN_PARAM}`,
  setPasswordTokenController(
    Routes.WELCOME,
    PageTitle.WELCOME,
    Routes.WELCOME,
    PageTitle.WELCOME,
    (res) => {
      return res.redirect(
        303,
        addQueryParamsToPath(
          `${Routes.CONSENTS}/${consentPages[0].page}`,
          res.locals.queryParams,
        ),
      );
    },
  ),
);

export default router;
