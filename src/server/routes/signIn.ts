import { Request, Router } from 'express';
import deepmerge from 'deepmerge';
import { authenticate } from '@/server/lib/idapi/auth';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { Routes } from '@/shared/model/Routes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/trackMetric';
import { PageTitle } from '@/shared/model/PageTitle';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { decrypt } from '@/server/lib/idapi/decryptToken';
import { FederationErrors, SignInErrors } from '@/shared/model/Errors';
import { ApiError } from '@/server/models/Error';
import { readEmailCookie } from '@/server/lib/emailCookie';
import handleRecaptcha from '@/server/lib/recaptcha';

const router = Router();

router.get(
  Routes.SIGN_IN,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const state = res.locals;
    const { encryptedEmail, error } = state.queryParams;

    // first attempt to get email from IDAPI encryptedEmail if it exists
    const decryptedEmail =
      encryptedEmail && (await decrypt(encryptedEmail, req.ip));

    // followed by the gateway EncryptedState
    // and the identity-frontend playSessionCookie
    // if it exists
    const email = decryptedEmail || readEmailCookie(req);

    const errorMessage =
      error === FederationErrors.SOCIAL_SIGNIN_BLOCKED
        ? SignInErrors.ACCOUNT_ALREADY_EXISTS
        : '';

    const html = renderer(Routes.SIGN_IN, {
      requestState: deepmerge(state, {
        pageData: {
          email,
        },
        globalMessage: {
          error: errorMessage,
        },
      }),
      pageTitle: PageTitle.SIGN_IN,
    });
    res.type('html').send(html);
  }),
);

router.post(
  Routes.SIGN_IN,
  handleRecaptcha,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const state = res.locals;

    const { email = '' } = req.body;
    const { password = '' } = req.body;

    const { returnUrl } = state.pageData;

    const { defaultReturnUri } = getConfiguration();

    try {
      const cookies = await authenticate(email, password, req.ip);

      setIDAPICookies(res, cookies);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);
      const { message, status } =
        error instanceof ApiError ? error : new ApiError();

      trackMetric('SignIn::Failure');

      // re-render the sign in page on error, with pre-filled email
      const html = renderer(Routes.SIGN_IN, {
        requestState: deepmerge(res.locals, {
          globalMessage: {
            error: message,
          },
          pageData: {
            email,
          },
        }),
        pageTitle: PageTitle.SIGN_IN,
      });

      return res.status(status).type('html').send(html);
    }

    trackMetric('SignIn::Success');

    return res.redirect(303, returnUrl || defaultReturnUri);
  }),
);

export default router;
