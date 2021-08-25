import { Request, Router } from 'express';
import { authenticate } from '@/server/lib/idapi/auth';
import {
  create,
  resendAccountVerificationEmail,
} from '@/server/lib/idapi/user';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { Routes } from '@/shared/model/Routes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/trackMetric';
import { Metrics } from '@/server/models/Metrics';
import { PageTitle } from '@/shared/model/PageTitle';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import deepmerge from 'deepmerge';
import { readEmailCookie, setGUEmailCookie } from '@/server/lib/emailCookie';
const router = Router();

router.get(
  Routes.REGISTRATION,
  (req: Request, res: ResponseWithRequestState) => {
    const html = renderer(Routes.REGISTRATION, {
      requestState: res.locals,
      pageTitle: PageTitle.REGISTRATION,
    });
    res.type('html').send(html);
  },
);

router.get(
  Routes.REGISTRATION_EMAIL_SENT,
  (req: Request, res: ResponseWithRequestState) => {
    const state = res.locals;
    const html = renderer(Routes.REGISTRATION_EMAIL_SENT, {
      requestState: deepmerge(state, {
        pageData: {
          email: readEmailCookie(req),
        },
      }),
      pageTitle: PageTitle.REGISTRATION_EMAIL_SENT,
    });
    res.type('html').send(html);
  },
);

// POST form handler to resend account verification email
router.post(
  `${Routes.REGISTRATION_EMAIL_SENT}${Routes.RESEND}`,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { email } = req.body;
    const { returnUrl } = res.locals.queryParams;

    try {
      await resendAccountVerificationEmail(email, req.ip, returnUrl);

      setGUEmailCookie(res, email);

      return res.redirect(303, Routes.REGISTRATION_EMAIL_SENT);
    } catch (error) {
      const { message, status } = error;
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      const html = renderer(`${Routes.REGISTRATION_EMAIL_SENT}`, {
        pageTitle: PageTitle.REGISTRATION_EMAIL_SENT,
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

router.post(
  Routes.REGISTRATION,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const { email = '' } = req.body;
    const { password = '' } = req.body;

    const { returnUrl } = state.queryParams;

    try {
      await create(email, password, req.ip);
      // TODO: Can we remove this second call to get cookies for the user once we move over to Okta?
      const cookies = await authenticate(email, password, req.ip);
      setIDAPICookies(res, cookies);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);
      const { message, status } = error;

      trackMetric(Metrics.REGISTER_FAILURE);

      state = deepmerge(state, {
        globalMessage: {
          error: message,
        },
        pageData: {
          email,
        },
      });

      const html = renderer(Routes.REGISTRATION, {
        requestState: state,
        pageTitle: PageTitle.REGISTRATION,
      });
      return res.status(status).type('html').send(html);
    }

    trackMetric(Metrics.REGISTER_SUCCESS);

    return res.redirect(303, returnUrl);
  }),
);

export default router;
