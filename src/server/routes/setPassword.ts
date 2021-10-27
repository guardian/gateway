import { Request, Router } from 'express';
import { Routes } from '@/shared/model/Routes';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { PageTitle } from '@/shared/model/PageTitle';
import {
  checkResetPasswordTokenController,
  setPasswordTokenController,
} from '@/server/controllers/changePassword';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import deepmerge from 'deepmerge';
import { RequestError } from '@/shared/lib/error';
import { logger } from '@/server/lib/logger';
import { setEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import { EmailType } from '@/shared/model/EmailType';
import { sendCreatePasswordEmail } from '@/server/lib/idapi/user';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { addReturnUrlToPath } from '@/server/lib/queryParams';

const router = Router();

// set password complete page
router.get(
  Routes.SET_PASSWORD_COMPLETE,
  (req: Request, res: ResponseWithRequestState) => {
    const email = readEmailCookie(req);

    const html = renderer(Routes.SET_PASSWORD_COMPLETE, {
      requestState: deepmerge(res.locals, {
        pageData: {
          email,
        },
      }),
      pageTitle: PageTitle.SET_PASSWORD_COMPLETE,
    });
    return res.type('html').send(html);
  },
);

// resend "create (set) password" email page
router.get(
  `${Routes.SET_PASSWORD}${Routes.RESEND}`,
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer(`${Routes.SET_PASSWORD}${Routes.RESEND}`, {
      pageTitle: PageTitle.SET_PASSWORD_RESEND,
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

// set password page session expired
router.get(
  `${Routes.SET_PASSWORD}${Routes.EXPIRED}`,
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer(`${Routes.SET_PASSWORD}${Routes.EXPIRED}`, {
      pageTitle: PageTitle.SET_PASSWORD_RESEND,
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

// POST handler for resending "create (set) password" email
router.post(
  `${Routes.SET_PASSWORD}${Routes.RESEND}`,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { email } = req.body;
    const { returnUrl } = res.locals.queryParams;

    try {
      await sendCreatePasswordEmail(email, req.ip, returnUrl);

      setEncryptedStateCookie(res, {
        email,
        emailType: EmailType.CREATE_PASSWORD,
      });

      return res.redirect(
        303,
        `${Routes.SET_PASSWORD}${Routes.SET_PASSWORD_EMAIL_SENT}`,
      );
    } catch (error) {
      const { message, status } = error as RequestError;
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      const html = renderer(`${Routes.SET_PASSWORD}${Routes.RESEND}`, {
        pageTitle: PageTitle.SET_PASSWORD_RESEND,
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
  Routes.SET_PASSWORD_EMAIL_SENT,
  (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const email = readEmailCookie(req);

    state = deepmerge(state, {
      pageData: {
        email,
        previousPage: `${Routes.SET_PASSWORD}${Routes.RESEND}`,
      },
    });

    const html = renderer(Routes.SET_PASSWORD_EMAIL_SENT, {
      pageTitle: PageTitle.EMAIL_SENT,
      requestState: state,
    });
    res.type('html').send(html);
  },
);

// set password page with token check
router.get(
  `${Routes.SET_PASSWORD}${Routes.TOKEN_PARAM}`,
  checkResetPasswordTokenController(
    Routes.SET_PASSWORD,
    PageTitle.SET_PASSWORD,
    Routes.SET_PASSWORD,
    PageTitle.SET_PASSWORD_RESEND,
  ),
);

// POST handler for set password page to set password
router.post(
  `${Routes.SET_PASSWORD}${Routes.TOKEN_PARAM}`,
  setPasswordTokenController(
    Routes.SET_PASSWORD,
    PageTitle.SET_PASSWORD,
    Routes.SET_PASSWORD,
    PageTitle.SET_PASSWORD_RESEND,
    (res) =>
      res.redirect(
        303,
        addReturnUrlToPath(
          Routes.SET_PASSWORD_COMPLETE,
          res.locals.queryParams.returnUrl,
        ),
      ),
  ),
);

export default router;
