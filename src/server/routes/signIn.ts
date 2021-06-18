import { Request, Router } from 'express';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { Routes } from '@/shared/model/Routes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/AWS';
import { Metrics } from '@/server/models/Metrics';
import { PageTitle } from '@/shared/model/PageTitle';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { authenticate } from '@/server/lib/okta/authentication';
import { FetchOktaError } from '@/server/lib/okta/error';
import {
  generateAuthorizationState,
  OktaOIDC,
  setAuthorizationStateCookie,
} from '@/server/lib/okta/oidc';
import { SignInErrors } from '@/shared/model/Errors';

const router = Router();

router.get(Routes.SIGN_IN, (req: Request, res: ResponseWithRequestState) => {
  const html = renderer(Routes.SIGN_IN, {
    requestState: res.locals,
    pageTitle: PageTitle.SIGN_IN,
  });
  return res.type('html').send(html);
});

router.get(
  Routes.SIGN_IN_CURRENT,
  (req: Request, res: ResponseWithRequestState) => {
    const html = renderer(Routes.SIGN_IN_CURRENT, {
      requestState: res.locals,
      pageTitle: PageTitle.SIGN_IN,
    });
    return res.type('html').send(html);
  },
);

router.post(
  Routes.SIGN_IN,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { email = '', password = '' } = req.body;

    try {
      const response = await authenticate(email, password);

      const authState = generateAuthorizationState(
        res.locals.queryParams.returnUrl,
      );

      setAuthorizationStateCookie(authState, res);

      const authorizeUrl = OktaOIDC.Client.authorizationUrl({
        prompt: 'none',
        sessionToken: response.sessionToken,
        state: authState.nonce,
      });

      trackMetric(Metrics.AUTHENTICATION_SUCCESS);

      return res.redirect(authorizeUrl);
    } catch (error) {
      trackMetric(Metrics.AUTHENTICATION_FAILURE);
      logger.error(error);

      if (error.oktaError) {
        const { status, oktaError } = error as FetchOktaError;

        const html = renderer(Routes.SIGN_IN, {
          requestState: {
            ...res.locals,
            globalMessage: {
              ...res.locals.globalMessage,
              error: oktaError.errorSummary,
            },
          },
          pageTitle: PageTitle.SIGN_IN,
        });
        return res.status(status).type('html').send(html);
      }

      const html = renderer(Routes.SIGN_IN, {
        requestState: {
          ...res.locals,
          globalMessage: {
            ...res.locals.globalMessage,
            error: SignInErrors.GENERIC,
          },
        },
        pageTitle: PageTitle.SIGN_IN,
      });
      return res.status(500).type('html').send(html);
    }
  }),
);

export default router;
