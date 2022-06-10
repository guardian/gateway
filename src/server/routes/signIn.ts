import { Request } from 'express';
import deepmerge from 'deepmerge';
import { authenticate as authenticateWithIdapi } from '@/server/lib/idapi/auth';
import { authenticate as authenticateWithOkta } from '@/server/lib/okta/api/authentication';
import { logger } from '@/server/lib/serverSideLogger';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/trackMetric';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { setIDAPICookies } from '@/server/lib/idapi/IDAPICookies';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { decrypt } from '@/server/lib/idapi/decryptToken';
import { FederationErrors, SignInErrors } from '@/shared/model/Errors';
import { ApiError } from '@/server/models/Error';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { readEmailCookie } from '@/server/lib/emailCookie';
import handleRecaptcha from '@/server/lib/recaptcha';
import { OktaError } from '@/server/models/okta/Error';
import { CONSENTS_POST_SIGN_IN_PAGE } from '@/shared/model/Consent';
import {
  getUserConsentsForPage,
  getConsentValueFromRequestBody,
  update as patchConsents,
} from '@/server/lib/idapi/consents';
import { loginMiddleware } from '@/server/lib/middleware/login';
import postSignInController from '@/server/lib/postSignInController';
import { performAuthorizationCodeFlow } from '@/server/lib/okta/oauth';
import { getSession } from '../lib/okta/api/sessions';
import { redirectIfLoggedIn } from '../lib/middleware/redirectIfLoggedIn';
import { getUser } from '../lib/okta/api/users';

const { okta, accountManagementUrl, oauthBaseUrl } = getConfiguration();

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
  redirectIfLoggedIn,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { useOkta } = res.locals.queryParams;
    const oktaSessionCookieId: string | undefined = req.cookies.sid;

    if (okta.enabled && useOkta && oktaSessionCookieId) {
      // for okta users landing on sign in, we want to first check if a session exists
      // if a session already exists then we redirect back to the returnUrl for apps, and the dotcom homepage for web
      // otherwise we want to show the sign in page
      try {
        //check if the user has a session, if they do, take them to the dotcom homepage,
        // or returnUrl for apps users
        await getSession(oktaSessionCookieId);
        return res.redirect(accountManagementUrl);
      } catch {
        //if their session was invalid, the Okta sessions api returns a 404 and the promise fails,
        //so we fall through to this catch block
        return showSignInPage(req, res);
      }
    } else {
      return showSignInPage(req, res);
    }
  }),
);

// We don't do any session checking on /reauthenticate - if someone's ended up
// here, it's probably because their session is invalid or expired and they need
// to be allowed to attempt to sign in again.
router.get(
  '/reauthenticate',
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const state = res.locals;
    const { encryptedEmail, error, error_description } = state.queryParams;

    // first attempt to get email from IDAPI encryptedEmail if it exists
    const decryptedEmail =
      encryptedEmail && (await decrypt(encryptedEmail, req.ip));

    // followed by the gateway EncryptedState
    // if it exists
    const email = decryptedEmail || readEmailCookie(req);

    const html = renderer('/reauthenticate', {
      requestState: deepmerge(state, {
        pageData: {
          email,
          displayRegisterTab: false,
        },
        globalMessage: {
          error: getErrorMessageFromQueryParams(error, error_description),
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
  const { email = '', password = '' } = req.body;
  const { pageData } = res.locals;
  const { returnUrl } = pageData;

  try {
    const cookies = await authenticateWithIdapi(
      email,
      password,
      req.ip,
      res.locals.queryParams,
    );

    setIDAPICookies(res, cookies);

    trackMetric('SignIn::Success');

    return postSignInController(req, res, cookies, returnUrl);
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
  const oktaSessionCookieId: string | undefined = req.cookies.sid;
  try {
    if (oktaSessionCookieId) {
      // if a session already exists then we redirect back to the returnUrl for apps, and the dotcom homepage for web
      await getSession(oktaSessionCookieId);
      return res.redirect(accountManagementUrl);
    }
  } catch {
    // We log this scenario as it is quite unlikely, but we continue to sign the user in.
    logger.info('User POSTed to /signin with an invalid `sid` session cookie');
  }

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

    // If the user was able to log in with Okta BUT NOT VALIDATED, we will still try and sign them in with Identity
    // This is because we will initally block unvalidated users from getting Okta sessions, but still allow them
    // Identity sessions.

    if (response._embedded?.user.id) {
      const user = await getUser(response._embedded.user.id);
      if (!user.profile.emailValidated) {
        return idapiSignInController(req, res);
      }
    }

    // we now need to generate an okta session
    // so we'll call the OIDC /authorize endpoint which sets a session cookie
    // we'll pretty much be performing the Authorization Code Flow
    return performAuthorizationCodeFlow(req, res, {
      sessionToken: response.sessionToken,
    });
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

const optInPromptController = async (
  req: Request,
  res: ResponseWithRequestState,
  errorMessage?: string,
) => {
  const state = res.locals;
  const { returnUrl } = state.pageData;
  const { defaultReturnUri } = getConfiguration();
  const redirectUrl = returnUrl || defaultReturnUri;

  try {
    const consents = await getUserConsentsForPage(
      CONSENTS_POST_SIGN_IN_PAGE,
      req.ip,
      req.cookies.SC_GU_U,
    );
    const html = renderer('/signin/success', {
      requestState: deepmerge(state, {
        pageData: {
          consents,
        },
        ...(errorMessage && {
          globalMessage: {
            error: errorMessage,
          },
        }),
      }),
      pageTitle: 'Signed in',
    });
    res.type('html').send(html);
  } catch (error) {
    logger.error(`${req.method} ${req.originalUrl}  Error`, error);
    return res.redirect(303, redirectUrl);
  }
};

router.get(
  '/signin/success',
  loginMiddleware,
  handleAsyncErrors((req: Request, res: ResponseWithRequestState) =>
    optInPromptController(req, res),
  ),
);

router.post(
  '/signin/success',
  loginMiddleware,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const state = res.locals;
    const { returnUrl } = state.pageData;
    const { defaultReturnUri } = getConfiguration();
    const redirectUrl = returnUrl || defaultReturnUri;
    const sc_gu_u = req.cookies.SC_GU_U;

    const consents = CONSENTS_POST_SIGN_IN_PAGE.map((id) => ({
      id,
      consented: getConsentValueFromRequestBody(id, req.body),
    }));
    const consented = consents.some((consent) => consent.consented);

    try {
      await patchConsents(req.ip, sc_gu_u, consents);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);
      trackMetric('PostSignInPrompt::Failure');

      /**
       * If user has consented, show them their preference failed to save
       * Otherwise, send them on their way as they are already opted out
       * (only opted out users are shown the prompt)
       */
      if (consented) {
        const { message } = error instanceof ApiError ? error : new ApiError();
        return optInPromptController(req, res, message);
      }
    }

    return res.redirect(303, redirectUrl);
  }),
);

type SocialProvider = 'google' | 'facebook' | 'apple';

const isValidSocialProvider = (provider: string): boolean =>
  ['facebook', 'google', 'apple'].includes(provider);

router.get('/signin/:social', (req: Request, res: ResponseWithRequestState) => {
  // todo can we use the login middleware here to stopped logged in users from accessing this endpoint?
  const { useOkta, returnUrl } = res.locals.queryParams;
  const socialIdp = req.params.social as SocialProvider;

  if (!isValidSocialProvider(socialIdp)) {
    return res.redirect(303, '/signin');
  }

  if (okta.enabled && useOkta) {
    // get the IDP id from the config
    const idp = okta.social[socialIdp];
    // if okta feature switch enabled, perform authorization code flow with idp
    return performAuthorizationCodeFlow(req, res, { idp });
  } else {
    // if okta feature switch disabled, redirect to identity-federation-api
    const socialUrl = new URL(`${oauthBaseUrl}/${socialIdp}/signin`);
    socialUrl.searchParams.append('returnUrl', returnUrl);

    return res.redirect(303, socialUrl.toString());
  }
});

export default router.router;
