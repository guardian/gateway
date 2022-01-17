import { Request } from 'express';
import deepmerge from 'deepmerge';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';

import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/trackMetric';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { decrypt } from '@/server/lib/idapi/decryptToken';
import { FederationErrors, SignInErrors } from '@/shared/model/Errors';
import { ApiError } from '@/server/models/Error';
import { authenticate as authenticateWithOkta } from '@/server/lib/okta/authenticate';
import { authenticate as authenticateWithIDAPI } from '@/server/lib/idapi/auth';
import {
  generateAuthorizationState,
  ProfileOpenIdClient,
  setAuthorizationStateCookie,
} from '@/server/lib/okta/oidc';
import { typedRouter as router } from '@/server/lib/typedRoutes';
import { readEmailCookie } from '@/server/lib/emailCookie';
import handleRecaptcha from '@/server/lib/recaptcha';
import { getConfiguration } from '@/server/lib/getConfiguration';

const { okta } = getConfiguration();

router.get(
  '/signin',
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const state = res.locals;

    const { encryptedEmail, error, error_description } = state.queryParams;

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
        : error_description;

    const html = renderer('/signin', {
      requestState: deepmerge(state, {
        pageData: {
          email,
        },
        globalMessage: {
          error: errorMessage,
        },
      }),
      pageTitle: 'Sign in',
    });
    res.type('html').send(html);
  }),
);

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

    trackMetric('SignIn::Success');

    // redirect the user to the /authorize endpoint
    return res.redirect(authorizeUrl);
  } catch (error) {
    trackMetric('SignIn::Failure');
    logger.error('Okta authentication error:', error);

    const { message, status } =
      error instanceof ApiError ? error : new ApiError();

    const html = renderer('/signin', {
      requestState: deepmerge(res.locals, {
        pageData: {
          email,
        },
        globalMessage: {
          error: message,
        },
      }),
      pageTitle: 'Sign in',
    });

    return res
      .status(status || 500)
      .type('html')
      .send(html);
  }
};

const idapiAuthenticationController = async (
  req: Request,
  res: ResponseWithRequestState,
) => {
  // get the request state
  const state = res.locals;

  // get the email and password from the request body
  const { email = '', password = '' } = req.body;

  // get the return url
  const { returnUrl } = state.queryParams;

  try {
    // authenticate with Identity API, which returns cookie object
    const cookies = await authenticateWithIDAPI(email, password, req.ip);

    // set cookie headers on response
    setIDAPICookies(res, cookies);

    trackMetric('SignIn::Success');

    // redirect to returnUrl
    return res.redirect(303, returnUrl);
  } catch (error) {
    logger.error(`${req.method} ${req.originalUrl}  Error`, error);

    const { message, status } =
      error instanceof ApiError ? error : new ApiError();

    // track failure
    trackMetric('SignIn::Failure');

    // re-render the sign in page on error
    const html = renderer('/signin', {
      requestState: deepmerge(state, {
        pageData: {
          email,
        },
        globalMessage: {
          error: message,
        },
      }),
      pageTitle: 'Sign in',
    });

    return res
      .status(status || 500)
      .type('html')
      .send(html);
  }
};

// main sign in form POST submit route
router.post(
  '/signin',
  handleRecaptcha,
  handleAsyncErrors((req: Request, res: ResponseWithRequestState) => {
    const { useOkta } = res.locals.queryParams;

    if (okta.enabled && useOkta) {
      // if okta feature switch enabled, use okta authentication
      return oktaAuthenticationController(req, res);
    } else {
      // if okta feature switch disabled, use identity authentication
      return idapiAuthenticationController(req, res);
    }
  }),
);

export default router.router;
