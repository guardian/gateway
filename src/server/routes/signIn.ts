import { Request } from 'express';
import deepmerge from 'deepmerge';
import { authenticate as authenticateWithIdapi } from '@/server/lib/idapi/auth';
import { authenticate as authenticateWithOkta } from '@/server/lib/okta/api/authentication';
import { logger } from '@/server/lib/serverSideLogger';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/trackMetric';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { decrypt } from '@/server/lib/idapi/decryptToken';
import { FederationErrors, SignInErrors } from '@/shared/model/Errors';
import { ApiError } from '@/server/models/Error';
import { typedRouter as router } from '@/server/lib/typedRoutes';
import { readEmailCookie } from '@/server/lib/emailCookie';
import handleRecaptcha from '@/server/lib/recaptcha';
import {
  generateAuthorizationState,
  ProfileOpenIdClient,
  setAuthorizationStateCookie,
} from '@/server/lib/okta/openid-connect';
import { OktaError } from '@/server/models/okta/Error';
import {
  readEncryptedStateCookie,
  updateEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { getPersistableQueryParams } from '@/shared/lib/queryParams';
import { RoutePaths } from '@/shared/model/Routes';

const { defaultReturnUri, okta } = getConfiguration();

/**
 * Method to perform the Authorization Code Flow
 * for a) the sign in session check
 * and b) post authentication (with the session token)
 * @param res - the express response object
 * @param sessionToken (optional) - if provided, we'll use this to set the session cookie
 * @param confirmationPagePath (optional) - page to redirect the user to after authentication
 * @returns 303 redirect to the okta /authorize endpoint
 */
export const performAuthCodeFlow = (
  res: ResponseWithRequestState,
  sessionToken?: string,
  confirmationPagePath?: RoutePaths,
) => {
  // firstly we generate and store a "state"
  // as a http only, secure, signed session cookie
  // which is a json object that contains a stateParam and the query params
  // the stateParam is used to protect against csrf
  const authState = generateAuthorizationState(
    getPersistableQueryParams(res.locals.queryParams),
    confirmationPagePath,
  );
  setAuthorizationStateCookie(authState, res);

  // generate the /authorize endpoint url which we'll redirect the user too
  const authorizeUrl = ProfileOpenIdClient.authorizationUrl({
    // Don't prompt for authentication or consent
    prompt: 'none',
    // The sessionToken from authentication to exchange for session cookie
    sessionToken,
    // we send the generated stateParam as the state parameter
    state: authState.stateParam,
    // any scopes, by default the 'openid' scope is required
    // the idapi_token_cookie_exchange scope is checked on IDAPI to return
    // idapi cookies on authentication
    scope: 'openid idapi_token_cookie_exchange',
  });

  // redirect the user to the /authorize endpoint
  return res.redirect(303, authorizeUrl);
};

/**
 * Helper method to determine if a global error should show on the sign in page
 * and return a user facing error if so
 * if there's no error it returns undefined
 * @param error - error query parameter
 * @param error_description - error_description query parameter
 * @returns string | undefined - user facing error message
 */
const getErrorMessageFromQueryParams = (
  error?: string,
  error_description?: string,
) => {
  // show error if account linking required
  if (error === FederationErrors.SOCIAL_SIGNIN_BLOCKED) {
    return SignInErrors.ACCOUNT_ALREADY_EXISTS;
  }
  // TODO: we're propagating a generic error message for now until we know what we're doing with the error_description parameter
  if (error_description) {
    return SignInErrors.GENERIC;
  }
};

/**
 * Controller to render the sign in page in both IDAPI and Okta
 */
const showSignInPage = async (req: Request, res: ResponseWithRequestState) => {
  const state = res.locals;
  const { encryptedEmail, error, error_description } = state.queryParams;

  // first attempt to get email from IDAPI encryptedEmail if it exists
  const decryptedEmail =
    encryptedEmail && (await decrypt(encryptedEmail, req.ip));

  // followed by the gateway EncryptedState
  // if it exists
  const email = decryptedEmail || readEmailCookie(req);

  const html = renderer('/signin', {
    requestState: deepmerge(state, {
      pageData: {
        email,
      },
      globalMessage: {
        error: getErrorMessageFromQueryParams(error, error_description),
      },
    }),
    pageTitle: 'Sign in',
  });
  return res.type('html').send(html);
};

router.get(
  '/signin',
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { useOkta } = res.locals.queryParams;
    if (okta.enabled && useOkta) {
      // for okta users landing on sign in, we want to first check if a session exists
      // if a session already exists then we want to refresh it and redirect back to the returnUrl
      // otherwise we want to show the sign in page
      // to facilitate this we'll use the EncryptedState cookie, and the `signInRedirect` property
      const encryptedState = readEncryptedStateCookie(req);

      // first check that the sign in session is checked (signInRedirect is true)
      // this means that the check is complete and show the sign in page
      if (encryptedState?.signInRedirect) {
        // remove the signInRedirect value from the cookie as the check is complete
        // as we've been redirected here from the oauth callback
        updateEncryptedStateCookie(req, res, {
          signInRedirect: undefined,
        });

        // render the sign in page
        return showSignInPage(req, res);
      } else {
        // sign in session check is not complete, so we want to check if a session exists
        // we do this by making an auth code request to okta
        return performAuthCodeFlow(res);
      }
    } else {
      return showSignInPage(req, res);
    }
  }),
);

router.post(
  '/signin',
  handleRecaptcha,
  handleAsyncErrors((req: Request, res: ResponseWithRequestState) => {
    const { useOkta } = res.locals.queryParams;
    if (okta.enabled && useOkta) {
      // if okta feature switch enabled, use okta authentication
      return oktaSignInController(req, res);
    } else {
      // if okta feature switch disabled, use identity authentication
      return idapiSignInController(req, res);
    }
  }),
);

const idapiSignInController = async (
  req: Request,
  res: ResponseWithRequestState,
) => {
  const state = res.locals;

  const { email = '', password = '' } = req.body;

  const { returnUrl } = state.pageData;

  try {
    const cookies = await authenticateWithIdapi(email, password, req.ip);

    setIDAPICookies(res, cookies);

    trackMetric('SignIn::Success');

    return res.redirect(303, returnUrl || defaultReturnUri);
  } catch (error) {
    logger.error(`${req.method} ${req.originalUrl}  Error`, error);
    const { message, status } =
      error instanceof ApiError ? error : new ApiError();

    trackMetric('SignIn::Failure');

    // re-render the sign in page on error, with pre-filled email
    const html = renderer('/signin', {
      requestState: deepmerge(res.locals, {
        globalMessage: {
          error: message,
        },
        pageData: {
          email,
        },
      }),
      pageTitle: 'Sign in',
    });

    return res.status(status).type('html').send(html);
  }
};

// handles errors in the catch block to return a error to display to the user
const oktaSignInControllerErrorHandler = (error: unknown) => {
  if (
    error instanceof OktaError &&
    error.name === 'AuthenticationFailedError'
  ) {
    return {
      status: error.status,
      message: SignInErrors.AUTHENTICATION_FAILED,
    };
  }

  return new OktaError({ message: SignInErrors.GENERIC });
};

const oktaSignInController = async (
  req: Request,
  res: ResponseWithRequestState,
) => {
  // get the email and password from the request body
  const { email = '', password = '' } = req.body;

  try {
    // attempt to authenticate with okta
    // if authentication fails, it will fall through to the catch
    // the response contains a one time use sessionToken that we can exchange
    // for a session cookie
    const response = await authenticateWithOkta({
      username: email,
      password,
    });

    // we're authenticated track this metric
    trackMetric('OktaSignIn::Success');

    // we now need to generate an okta session
    // so we'll call the OIDC /authorize endpoint which sets a session cookie
    // we'll pretty much be performing the Authorization Code Flow
    return performAuthCodeFlow(res, response.sessionToken);
  } catch (error) {
    trackMetric('OktaSignIn::Failure');

    logger.error('Okta authentication error:', error);

    const { message, status } = oktaSignInControllerErrorHandler(error);

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

    return res.status(status).type('html').send(html);
  }
};

export default router.router;
