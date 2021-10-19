import { Request, Router } from 'express';
import {
  resendAccountExistsEmail,
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
import deepmerge from 'deepmerge';
import { getEmailFromPlaySessionCookie } from '../lib/playSessionCookie';
import { RequestError } from '@/shared/lib/error';
import { guest } from '../lib/idapi/guest';
import { RecaptchaV2 } from 'express-recaptcha';
import { getConfiguration } from '../lib/getConfiguration';
import { CaptchaErrors, GenericErrors } from '@/shared/model/Errors';
import {
  readEncryptedStateCookie,
  setEncryptedStateCookie,
} from '../lib/encryptedStateCookie';
import { EmailType } from '@/shared/model/EmailType';

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
          email:
            getEmailFromPlaySessionCookie(req) ||
            readEncryptedStateCookie(req)?.email,
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
    const { returnUrl } = res.locals.queryParams;

    try {
      // read and parse the encrypted state cookie
      const encryptedState = readEncryptedStateCookie(req);

      // read the email from the PlaySessionCookie or the EncryptedState
      // we attempt to read from the PlaySessionCookie first as it's likely
      // the registration came from identity-frontend until the register page
      // is at 100% of all users on gateway
      const email = getEmailFromPlaySessionCookie(req) || encryptedState?.email;

      // check the email exists
      if (typeof email !== 'undefined') {
        // read the type of email we sent to the user based on the EncryptedState set
        // we default to GUEST_REGISTER as it's likely that if the value doesn't exist
        // they are a new user registration
        const emailType: EmailType =
          encryptedState?.emailType ?? EmailType.GUEST_REGISTER;

        // depending on the EmailType that was originally sent to the user
        // we determine which email to resend
        switch (emailType) {
          // they were a newly registered user, so resend the AccountVerification Email
          case EmailType.GUEST_REGISTER:
            await resendAccountVerificationEmail(email, req.ip, returnUrl);
            break;
          // they were an already registered user, so resend the AccountExists Email
          case EmailType.ACCOUNT_EXISTS:
            await resendAccountExistsEmail(email, req.ip, returnUrl);
            break;
          default:
            // somethings gone wrong, throw a generic error
            throw { message: GenericErrors.DEFAULT, status: 500 };
        }

        setEncryptedStateCookie(res, { email, emailType });
        return res.redirect(303, Routes.REGISTRATION_EMAIL_SENT);
      } else {
        throw { message: GenericErrors.DEFAULT, status: 500 };
      }
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

      const emailType = await guest(email, req.ip, returnUrl, refViewId, ref);

      // read the type of email we sent to the user based on the emailType
      switch (emailType) {
        // they were an already registered user, so resend the AccountExists Email
        case EmailType.ACCOUNT_EXISTS:
          await resendAccountExistsEmail(email, req.ip, returnUrl);
          break;
        // by default take no action, as it's likely their email type is GUEST_REGISTER
        // where an email would've already been send by the `guest` method above
        default:
          // we only want to track this success metric here as it's a new registration
          trackMetric(Metrics.REGISTER_SUCCESS);
          break;
      }

      // set the encrypted state cookie, so the next page is aware
      // of the email address and type of email sent
      // so if needed it can resend the correct email
      setEncryptedStateCookie(res, { email, emailType });

      // redirect the user to the email sent page
      return res.redirect(303, Routes.REGISTRATION_EMAIL_SENT);
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
  }),
);

export default router;
