import { NextFunction, Request } from 'express';
import { joinUrl } from '@guardian/libs';
import { read } from '@/server/lib/idapi/auth';
import { IDAPIAuthRedirect, IDAPIAuthStatus } from '@/shared/model/IDAPIAuth';
import { getProfileUrl } from '@/server/lib/getProfileUrl';

import { trackMetric } from '@/server/lib/trackMetric';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from '@/server/lib/serverSideLogger';
import { addQueryParamsToUntypedPath } from '@/shared/lib/queryParams';
import { ResponseWithRequestState } from '@/server/models/Express';
import { buildUrl } from '@/shared/lib/routeUtils';
import {
  performAuthorizationCodeFlow,
  scopesForApplication,
} from '@/server/lib/okta/oauth';
import { RoutePaths } from '@/shared/model/Routes';
import { ProfileOpenIdClientRedirectUris } from '@/server/lib/okta/openid-connect';
import {
  checkAndDeleteOAuthTokenCookies,
  getOAuthTokenCookie,
  verifyAccessToken,
  verifyIdToken,
} from '@/server/lib/okta/tokens';

const profileUrl = getProfileUrl();

export const loginMiddlewareOAuth = async (
  req: Request,
  res: ResponseWithRequestState,
  next: NextFunction,
) => {
  if (res.locals.queryParams.useIdapi) {
    trackMetric('LoginMiddlewareOAuth::UseIdapi');
    return loginMiddleware(req, res, next);
  }

  // if a user has the GU_SO cookie, they have recently signed out
  // so we need to clear any existing tokens
  // and perform the auth code flow to get new tokens
  // and log the user in if necessary
  if (req.cookies.GU_SO) {
    trackMetric('LoginMiddlewareOAuth::SignedOutCookie');

    // clear existing tokens
    checkAndDeleteOAuthTokenCookies(req, res);

    // perform the auth code flow
    return performAuthorizationCodeFlow(req, res, {
      redirectUri: ProfileOpenIdClientRedirectUris.APPLICATION,
      scopes: scopesForApplication,
      confirmationPagePath: req.path as RoutePaths, //req.path will always be a RoutePaths
    });
  }

  // no
  // 2. has valid oauth access and id tokens
  const accessTokenCookie = getOAuthTokenCookie(req, 'GU_ACCESS_TOKEN');
  const idTokenCookie = getOAuthTokenCookie(req, 'GU_ID_TOKEN');

  if (accessTokenCookie && idTokenCookie) {
    trackMetric('LoginMiddlewareOAuth::HasOAuthTokens');
    const accessToken = await verifyAccessToken(accessTokenCookie);
    const idToken = await verifyIdToken(idTokenCookie);

    // yes: isLoggedIn = true, no need to get new tokens
    if (accessToken && idToken && !accessToken.isExpired()) {
      trackMetric('LoginMiddlewareOAuth::OAuthTokensValid');

      // store the oauth state in res.locals state
      // eslint-disable-next-line functional/immutable-data
      res.locals.oauthState = {
        accessToken,
        idToken,
      };

      return next();
    } else {
      trackMetric('LoginMiddlewareOAuth::OAuthTokensInvalid');
    }
  } else {
    trackMetric('LoginMiddlewareOAuth::NoOAuthTokens');
  }

  // no: attempt to do auth code flow to get new tokens
  // perform the auth code flow
  return performAuthorizationCodeFlow(req, res, {
    redirectUri: ProfileOpenIdClientRedirectUris.APPLICATION,
    scopes: scopesForApplication,
    confirmationPagePath: req.path as RoutePaths, //req.path will always be a RoutePaths
  });
};

export const loginMiddleware = async (
  req: Request,
  res: ResponseWithRequestState,
  next: NextFunction,
) => {
  const { signInPageUrl: LOGIN_REDIRECT_URL } = getConfiguration();

  const redirectAuth = (auth: IDAPIAuthRedirect) => {
    if (auth.redirect) {
      const redirect = addQueryParamsToUntypedPath(auth.redirect.url, {
        ...res.locals.queryParams,
        returnUrl: joinUrl(profileUrl, req.path),
      });
      return res.redirect(303, redirect);
    }

    return res.redirect(
      303,
      addQueryParamsToUntypedPath(LOGIN_REDIRECT_URL, {
        ...res.locals.queryParams,
        returnUrl: joinUrl(profileUrl, req.path),
      }),
    );
  };

  const sc_gu_u = req.cookies.SC_GU_U;
  const sc_gu_la = req.cookies.SC_GU_LA;

  if (!sc_gu_u || !sc_gu_la) {
    res.redirect(
      303,
      addQueryParamsToUntypedPath(LOGIN_REDIRECT_URL, {
        ...res.locals.queryParams,
        returnUrl: joinUrl(profileUrl, req.path),
      }),
    );
    return;
  }

  try {
    const auth = await read(sc_gu_u, sc_gu_la, req.ip, res.locals.requestId);

    if (auth.status === IDAPIAuthStatus.SIGNED_OUT) {
      trackMetric('LoginMiddlewareNotSignedIn');
      return redirectAuth(auth);
    }

    if (!auth.emailValidated) {
      trackMetric('LoginMiddlewareUnverified');
      return res.redirect(303, buildUrl('/verify-email'));
    }

    if (auth.status === IDAPIAuthStatus.RECENT) {
      trackMetric('LoginMiddleware::Success');
      next();
    } else {
      trackMetric('LoginMiddlewareNotRecent');
      return redirectAuth(auth);
    }
  } catch (e) {
    logger.error('loginMiddlewareFailure', e, {
      request_id: res.locals.requestId,
    });
    trackMetric('LoginMiddleware::Failure');
    res.redirect(
      303,
      addQueryParamsToUntypedPath(
        LOGIN_REDIRECT_URL,
        {
          ...res.locals.queryParams,
          returnUrl: joinUrl(profileUrl, req.path),
        },
        {
          error: 'signin-error-bad-request',
        },
      ),
    );
  }
};
