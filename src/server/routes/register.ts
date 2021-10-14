import { Request, Router } from 'express';
import { resendAccountVerificationEmail } from '@/server/lib/idapi/user';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { Routes } from '@/shared/model/Routes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/trackMetric';
import { Metrics } from '@/server/models/Metrics';
import { PageTitle } from '@/shared/model/PageTitle';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import deepmerge from 'deepmerge';
import { readGUEmailCookie, setGUEmailCookie } from '@/server/lib/emailCookie';
import { getEmailFromPlaySessionCookie } from '../lib/playSessionCookie';
import { RequestError } from '@/shared/lib/error';
import { guest } from '../lib/idapi/guest';
import { RecaptchaV2 } from 'express-recaptcha';
import { getConfiguration } from '../lib/getConfiguration';
import { CaptchaErrors } from '@/shared/model/Errors';

const router = Router();

// set google recaptcha site key
const {
  googleRecaptcha: { secretKey, siteKey },
} = getConfiguration();

const recaptcha = new RecaptchaV2(siteKey, secretKey);

router.get(
  Routes.REGISTRATION,
  (req: Request, res: ResponseWithRequestState) => {
    const html = renderer(Routes.REGISTRATION, {
      requestState: deepmerge(res.locals, {
        pageData: {
          recaptchaSiteKey: siteKey,
        },
      }),
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
          email: getEmailFromPlaySessionCookie(req) || readGUEmailCookie(req),
        },
      }),
      pageTitle: PageTitle.REGISTRATION_EMAIL_SENT,
    });
    res.type('html').send(html);
  },
);

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
      const { message, status } = error as RequestError;
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
  recaptcha.middleware.verify,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const { email = '' } = req.body;
    const { returnUrl, ref, refViewId } = state.queryParams;

    try {
      if (req.recaptcha?.error) {
        logger.error(
          'Problem verifying recaptcha, error response: ',
          req.recaptcha.error,
        );
        throw {
          message: CaptchaErrors.GENERIC,
          status: 400,
        };
      }
      await guest(email, req.ip, returnUrl, refViewId, ref);
      setGUEmailCookie(res, email);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);
      const { message, status } = error as RequestError;

      trackMetric(Metrics.REGISTER_FAILURE);

      state = deepmerge(state, {
        globalMessage: {
          error: message,
        },
        pageData: {
          email,
          recaptchaSiteKey: siteKey,
        },
      });

      const html = renderer(Routes.REGISTRATION, {
        requestState: state,
        pageTitle: PageTitle.REGISTRATION,
      });
      return res.status(status).type('html').send(html);
    }

    trackMetric(Metrics.REGISTER_SUCCESS);

    return res.redirect(303, Routes.REGISTRATION_EMAIL_SENT);
  }),
);

export default router;
