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

// main sign in form POST submit route
router.post(
  Routes.SIGN_IN,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    // get the email and password from the request body
    const { email = '', password = '' } = req.body;

    try {
      // attempt to authenticate with okta
      // if authentication fails, it will fall through to the catch
      // the response contains a on etime use sessionToken that we can exchange
      // for a session cookie
      const response = await authenticate(email, password);

      // we're authenticated! we know need to generate an okta session
      // so we'll call the OIDC /authorize endpoint which sets a session cookie
      // we'll pretty much be performing the Authorization Code Flow

      // firstly we generate and store a "state"
      // as a http only, secure, signed session cookie
      // which is a json object that contains a nonce and the return url
      // the nonce is used to protect against csrf
      const authState = generateAuthorizationState(
        res.locals.queryParams.returnUrl,
      );
      setAuthorizationStateCookie(authState, res);

      // generate the /authorize endpoint url which we'll redirect the user too
      const authorizeUrl = OktaOIDC.Client.authorizationUrl({
        // Don't prompt for authentication or consent
        prompt: 'none',
        // The sessionToken from authentication to exchange for session cookie
        sessionToken: response.sessionToken,
        // we send the generated nonce as the state parameter
        state: authState.nonce,
        // any scopes, by default the 'openid' scope is required
        // the idapi_token_cookie_exchange scope is checked on IDAPI to return
        // idapi cookies on authentication
        scope: 'openid idapi_token_cookie_exchange',
      });

      trackMetric(Metrics.AUTHENTICATION_SUCCESS);

      // redirect the user to the /authorize endpoint
      return res.redirect(authorizeUrl);
    } catch (error) {
      trackMetric(Metrics.AUTHENTICATION_FAILURE);
      logger.error(error);

      // errors for okta are formatted with the oktaError property
      if (error.oktaError) {
        const { status, oktaError } = error as FetchOktaError;

        // re-render the sign in page on error
        const html = renderer(Routes.SIGN_IN, {
          requestState: {
            ...res.locals,
            globalMessage: {
              ...res.locals.globalMessage,
              // the error message provided by okta
              error: oktaError.errorSummary,
            },
          },
          pageTitle: PageTitle.SIGN_IN,
        });
        return res.status(status).type('html').send(html);
      }

      // or any generic error
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
