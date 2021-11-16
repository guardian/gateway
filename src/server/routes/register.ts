import { Request, Router } from 'express';
import {
  readUserType,
  sendAccountExistsEmail,
  sendAccountWithoutPasswordExistsEmail,
  sendAccountVerificationEmail,
  UserType,
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
import { getEmailFromPlaySessionCookie } from '@/server/lib/playSessionCookie';
import { guest } from '@/server/lib/idapi/guest';
import { RecaptchaV2 } from 'express-recaptcha';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { CaptchaErrors, GenericErrors } from '@/shared/model/Errors';
import {
  readEncryptedStateCookie,
  setEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { EmailType } from '@/shared/model/EmailType';
import { ApiError } from '@/server/models/Error';
import { register } from '@/server/lib/okta/registration';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';

const router = Router();

const {
  googleRecaptcha: { secretKey, siteKey },
  okta,
} = getConfiguration();

// set google recaptcha site key
const recaptcha = new RecaptchaV2(siteKey, secretKey);

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
  `${Routes.REGISTRATION}${Routes.EMAIL_SENT}`,
  (req: Request, res: ResponseWithRequestState) => {
    const state = res.locals;
    const html = renderer(`${Routes.REGISTRATION}${Routes.EMAIL_SENT}`, {
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
  `${Routes.REGISTRATION}${Routes.RESEND}`,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { returnUrl, emailSentSuccess } = res.locals.queryParams;

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
          encryptedState?.emailType ?? EmailType.ACCOUNT_VERIFICATION;

        // depending on the EmailType that was originally sent to the user
        // we determine which email to resend
        switch (emailType) {
          // they were a newly registered user, so resend the AccountVerification Email
          case EmailType.ACCOUNT_VERIFICATION:
            await sendAccountVerificationEmail(email, req.ip, returnUrl);
            break;
          // they were an already registered user, so resend the AccountExists Email
          case EmailType.ACCOUNT_EXISTS:
            await sendAccountExistsEmail(email, req.ip, returnUrl);
            break;
          // they were an already registered user without password
          // so resend the AccountWithoutPasswordExists Email
          case EmailType.ACCOUNT_WITHOUT_PASSWORD_EXISTS:
            await sendAccountWithoutPasswordExistsEmail(
              email,
              req.ip,
              returnUrl,
            );
            break;
          default:
            // somethings gone wrong, throw a generic error
            throw new ApiError({ message: GenericErrors.DEFAULT, status: 500 });
        }

        setEncryptedStateCookie(res, { email, emailType });
        return res.redirect(
          303,
          addQueryParamsToPath(
            `${Routes.REGISTRATION}${Routes.EMAIL_SENT}`,
            res.locals.queryParams,
            { emailSentSuccess },
          ),
        );
      } else {
        throw new ApiError({ message: GenericErrors.DEFAULT, status: 500 });
      }
    } catch (error) {
      const { message, status } =
        error instanceof ApiError ? error : new ApiError();

      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      const html = renderer(`${Routes.REGISTRATION}${Routes.EMAIL_SENT}`, {
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
        throw new ApiError({
          message: CaptchaErrors.GENERIC,
          status: 400,
        });
      }

      // use idapi user type endpoint to determine user type
      const userType = await readUserType(email, req.ip);

      // check what type of user they are to determine course of action
      switch (userType) {
        // new user, so call guest register endpoint to create user account without password
        // and automatically send account verification email
        case UserType.NEW:
          if (okta.registrationEnabled) {
            await register(email);
          } else {
            await guest(email, req.ip, returnUrl, refViewId, ref);
          }
          // set the encrypted state cookie in each case, so the next page is aware
          // of the email address and type of email sent
          // so if needed it can resend the correct email
          setEncryptedStateCookie(res, {
            email,
            emailType: EmailType.ACCOUNT_VERIFICATION,
          });
          break;
        // user exists with password
        // so we want to send them the account exists email
        case UserType.CURRENT:
          await sendAccountExistsEmail(email, req.ip, returnUrl);
          setEncryptedStateCookie(res, {
            email,
            emailType: EmailType.ACCOUNT_EXISTS,
          });
          break;
        // user exists without password
        // so we send them the account exists without password email to set a password
        case UserType.GUEST:
          await sendAccountWithoutPasswordExistsEmail(email, req.ip, returnUrl);
          setEncryptedStateCookie(res, {
            email,
            emailType: EmailType.ACCOUNT_WITHOUT_PASSWORD_EXISTS,
          });
          break;
        default:
          // shouldn't reach this point, so we want to catch this
          // as an error just in case
          throw new Error('Invalid UserType');
      }

      // redirect the user to the email sent page
      return res.redirect(
        303,
        addQueryParamsToPath(
          `${Routes.REGISTRATION}${Routes.EMAIL_SENT}`,
          res.locals.queryParams,
        ),
      );
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      const { message, status } =
        error instanceof ApiError ? error : new ApiError();

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
