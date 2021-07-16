import { Request, Router } from 'express';
import deepmerge from 'deepmerge';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { Routes } from '@/shared/model/Routes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/trackMetric';
import { Metrics } from '@/server/models/Metrics';
import { PageTitle } from '@/shared/model/PageTitle';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { authenticate as authenticateWithOkta } from '@/server/lib/okta/authenticate';
import { authenticate as authenticateWithIDAPI } from '@/server/lib/idapi/auth';
import {
  generateAuthorizationState,
  ProfileOpenIdClient,
  setAuthorizationStateCookie,
} from '@/server/lib/okta/oidc';
import { SignInErrors } from '@/shared/model/Errors';
import { featureSwitches } from '@/shared/lib/featureSwitches';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';

const router = Router();

router.get(Routes.SIGN_IN, (req: Request, res: ResponseWithRequestState) => {
  let state = res.locals;

  if (state.queryParams.error_description) {
    state = deepmerge(state, {
      globalMessage: {
        error: `${state.queryParams.error_description}`,
      },
    });
  }

  const html = renderer(Routes.SIGN_IN, {
    requestState: state,
    pageTitle: PageTitle.SIGN_IN,
  });
  return res.type('html').send(html);
});

const oktaAuthenticationController = async (
  req: Request,
  res: ResponseWithRequestState,
) => {
  // get the email and password from the request body
  const { email = '', password = '' } = req.body;

  try {
    // attempt to authenticate with okta
    // if authentication fails, it will fall through to the catch
    // the response contains a on etime use sessionToken that we can exchange
    // for a session cookie
    const response = await authenticateWithOkta(email, password);

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
    const authorizeUrl = ProfileOpenIdClient.authorizationUrl({
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
    logger.error('Okta authentication error:', error);

    const html = renderer(Routes.SIGN_IN, {
      requestState: deepmerge(res.locals, {
        pageData: {
          email,
          fieldErrors: [
            {
              field: 'summary',
              message: error.message || SignInErrors.GENERIC,
            },
          ],
        },
      }),
      pageTitle: PageTitle.SIGN_IN,
    });
    return res
      .status(error.status || 500)
      .type('html')
      .send(html);
  }
};

const idapiAuthenticationController = async (
  req: Request,
  res: ResponseWithRequestState,
) => {
  // get the request state
  let state = res.locals;

  // get the email and password from the request body
  const { email = '', password = '' } = req.body;

  // get the return url
  const { returnUrl } = state.queryParams;

  try {
    // authenticate with Identity API, which returns cookie object
    const cookies = await authenticateWithIDAPI(email, password, req.ip);

    // set cookie headers on response
    setIDAPICookies(res, cookies);

    // track success
    trackMetric(Metrics.AUTHENTICATION_SUCCESS);

    // redirect to returnUrl
    return res.redirect(303, returnUrl);
  } catch (error) {
    logger.error(`${req.method} ${req.originalUrl}  Error`, error);

    // track failure
    trackMetric(Metrics.AUTHENTICATION_FAILURE);

    // if error has a message, attach it to state
    if (error.message) {
      const { message } = error;

      state = deepmerge(state, {
        globalMessage: {
          error: message,
        },
      });
    } else {
      // otherwise show a generic error
      state = deepmerge(state, {
        globalMessage: {
          error: SignInErrors.GENERIC,
        },
      });
    }

    // re-render the sign in page on error
    const html = renderer(Routes.SIGN_IN, {
      requestState: state,
      pageTitle: PageTitle.SIGN_IN,
    });

    return res
      .status(error.status || 500)
      .type('html')
      .send(html);
  }
};

// main sign in form POST submit route
router.post(
  Routes.SIGN_IN,
  handleAsyncErrors((req: Request, res: ResponseWithRequestState) => {
    if (featureSwitches.oktaAuthentication) {
      // if okta feature switch enabled, use okta authentication
      return oktaAuthenticationController(req, res);
    } else {
      // if okta feature switch disabled, use identity authentication
      return idapiAuthenticationController(req, res);
    }
  }),
);

export default router;
