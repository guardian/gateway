import { NextFunction, Request } from 'express';
import { joinUrl } from '@guardian/libs';
import { getProfileUrl } from '@/server/lib/getProfileUrl';

import { trackMetric } from '@/server/lib/trackMetric';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { addQueryParamsToUntypedPath } from '@/shared/lib/queryParams';
import { ResponseWithRequestState } from '@/server/models/Express';
import {
	performAuthorizationCodeFlow,
	Scopes,
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
import { getCurrentSession } from '@/server/lib/okta/api/sessions';

const profileUrl = getProfileUrl();

const { signInPageUrl: LOGIN_REDIRECT_URL } = getConfiguration();

export const loginMiddlewareOAuth = async (
	req: Request,
	res: ResponseWithRequestState,
	next: NextFunction,
) => {
	// check if the user has an existing Okta session cookie
	// if they don't have a valid session, redirect them to the login page, and clear any existing tokens
	try {
		// Okta Identity Engine session cookie is called `idx`
		const oktaIdentityEngineSessionCookieId: string | undefined =
			req.cookies.idx;

		if (!oktaIdentityEngineSessionCookieId) {
			// if there is no okta session cookie, go to the catch block
			throw new Error('No Okta session cookie');
		}

		// if there is an okta session cookie, check if it is valid, if not `getSession` will throw an error
		await getCurrentSession({
			idx: oktaIdentityEngineSessionCookieId,
		});
	} catch (error) {
		trackMetric('LoginMiddlewareOAuth::NoOktaSession');

		// clear existing tokens
		checkAndDeleteOAuthTokenCookies(req, res);

		// redirect to the login page, with the returnUrl set to the current page
		return res.redirect(
			303,
			addQueryParamsToUntypedPath(LOGIN_REDIRECT_URL, {
				...res.locals.queryParams,
				returnUrl: joinUrl(profileUrl, req.path),
			}),
		);
	}

	// 1. Check if the reader has a valid access token and id token.
	// This does not mean that the current reader is definitely signed in, so we have to perform additional checks.
	const accessTokenCookie = getOAuthTokenCookie(req, 'GU_ACCESS_TOKEN');
	const idTokenCookie = getOAuthTokenCookie(req, 'GU_ID_TOKEN');

	if (accessTokenCookie && idTokenCookie) {
		trackMetric('LoginMiddlewareOAuth::HasOAuthTokens');
		const accessToken = await verifyAccessToken(accessTokenCookie);
		const idToken = await verifyIdToken(idTokenCookie);

		if (
			// check access token is valid
			accessToken &&
			// check that the id token is valid
			idToken &&
			// check that the access token is not expired
			!accessToken.isExpired() &&
			// check that the scopes are all the ones we expect
			accessToken.claims.scp?.every((scope) =>
				scopesForApplication.includes(scope as Scopes),
			)
		) {
			// valid tokens at this point
			// 2. Check if the user has the `GU_SO` cookie
			if (req.cookies.GU_SO) {
				// if the user has a `GU_SO` cookie, compare the value to the `iat` claim in the access and id tokens
				// if the `GU_SO` cookie (lastSignOut) is newer than the tokens, the user has recently signed out and we need to clear the tokens
				const lastSignOut = parseInt(req.cookies.GU_SO);
				const accessTokenIat = accessToken.claims.iat;
				const idTokenIat = idToken.claims.iat;

				if (
					// validate `iat`
					typeof accessTokenIat === 'number' &&
					typeof idTokenIat === 'number' &&
					// check if lastSignOut is in the past
					lastSignOut <= Math.floor(Date.now() / 1000) &&
					// check if lastSignOut is newer than the tokens
					(lastSignOut > accessTokenIat || lastSignOut > idTokenIat)
				) {
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
			}

			// otherwise the user has not recently signed out, so we can continue
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
