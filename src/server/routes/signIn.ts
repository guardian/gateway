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
import {
  AuthenticationFailedError,
  OktaError,
} from '@/server/models/okta/Error';

const { defaultReturnUri, okta } = getConfiguration();

router.get(
  '/signin',
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const state = res.locals;
    const { encryptedEmail, error } = state.queryParams;

    // first attempt to get email from IDAPI encryptedEmail if it exists
    const decryptedEmail =
      encryptedEmail && (await decrypt(encryptedEmail, req.ip));

    // followed by the gateway EncryptedState
    // if it exists
    const email = decryptedEmail || readEmailCookie(req);

    const errorMessage =
      error === FederationErrors.SOCIAL_SIGNIN_BLOCKED
        ? SignInErrors.ACCOUNT_ALREADY_EXISTS
        : '';

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
    trackMetric('SignIn::Success');

    // we now need to generate an okta session
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

    // redirect the user to the /authorize endpoint
    return res.redirect(authorizeUrl);
  } catch (error) {
    trackMetric('SignIn::Failure');

    logger.error('Okta authentication error:', error);

    const { message, status } = ((error: unknown) => {
      if (error instanceof AuthenticationFailedError) {
        return {
          status: error.status,
          message: SignInErrors.AUTHENTICATION_FAILED,
        };
      }

      return new OktaError(SignInErrors.GENERIC);
    })(error);

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
