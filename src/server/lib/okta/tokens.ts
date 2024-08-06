import { joinUrl } from '@guardian/libs';
import OktaJwtVerifier from '@okta/jwt-verifier';
import type { CookieOptions, Request } from 'express';
import ms from 'ms';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from '@/server/lib/serverSideLogger';
import { GU_DOMAIN } from '@/server/models/Configuration';
import type { ResponseWithRequestState } from '@/server/models/Express';

/**
 * Configuration
 */
const { okta, baseUri, stage } = getConfiguration();

/**
 * OAuth Token Name Type
 */
type OAuthCookieNames =
	| typeof OAuthAccessTokenCookieName
	| typeof OAuthIdTokenCookieName;

/**
 * Name of the OAuth Access Token cookie to set
 * @type {string}
 */
const OAuthAccessTokenCookieName = 'GU_ACCESS_TOKEN';

/**
 * Name of the OAuth ID Token cookie to set
 * @type {string}
 */
const OAuthIdTokenCookieName = 'GU_ID_TOKEN';

const issuerDomain = () => {
	// if we're in cypress mocked, we need to add https to the issuer domain, just to get it
	// to validate, even if we never actually use the verifier in cypress mocked tests
	if (process.env.RUNNING_IN_CYPRESS_MOCKED === 'true') {
		return okta.orgUrl.replace('http://', 'https://');
	}
	// If we're in DEV, but we're developing against okta CODE environment, the issuer domain
	// should be the okta CODE domain, hence we need this check to get the issuer right
	if (stage === 'DEV' && process.env.GU_OKTA_ENV_COOKIE === 'CODE') {
		return `https://profile.${GU_DOMAIN.CODE}/`;
	}
	return joinUrl(okta.orgUrl, '/');
};

/**
 * @name verifierSharedOptions
 * @type {OktaJwtVerifier.VerifierOptions}
 * @description Okta JWT Verifier - Shared Options between the access token and ID token verifiers
 */
const verifierSharedOptions: OktaJwtVerifier.VerifierOptions = {
	issuer: joinUrl(issuerDomain(), '/oauth2/', okta.authServerId),
	clientId: okta.clientId,
};

/**
 * @name oauthAccessTokenVerifier
 * @type {OktaJwtVerifier}
 * @description Okta JWT Verifier - Access Token
 *
 * This verifier is used to verify the access token, as Okta JWT Verifier doesn't verify
 * the clientId claim access, we need to assert it manually for the access token (`cid` claim) which is different
 * from the ID token (`aud` claim) where Okta verifies it through the `expectedClientId` parameter in `verifyIdToken`.
 *
 * This is because in Gateway we want to make sure the access token is for this application, and not for any other before
 * we send it to other APIs.
 */
const oauthAccessTokenVerifier: Pick<OktaJwtVerifier, 'verifyAccessToken'> =
	new OktaJwtVerifier({
		...verifierSharedOptions,
		assertClaims: {
			cid: okta.clientId,
		},
	});

/**
 * @name oauthIDTokenVerifier
 * @type {OktaJwtVerifier}
 * @description Okta JWT Verifier - ID Token
 *
 * This verifier is used to verify the ID token, as Okta JWT Verifier doesn't verify
 * the clientId claim access, we need to assert it manually for the access token (`cid` claim) which is different
 * from the ID token (`aud` claim) where Okta verifies it through the `expectedClientId` parameter in `verifyIdToken`.
 *
 * This is because in Gateway we want to make sure the access token is for this application, and not for any other before
 * we send it to other APIs.
 */
const oauthIDTokenVerifier: Pick<OktaJwtVerifier, 'verifyIdToken'> =
	new OktaJwtVerifier({
		...verifierSharedOptions,
	});

export const verifyAccessToken = async (token: string) => {
	try {
		const jwt = await oauthAccessTokenVerifier.verifyAccessToken(
			token,
			issuerDomain(),
		);
		return jwt;
	} catch (error) {
		logger.error('Okta | Access Token | Verification Error', error);
	}
};

export const verifyIdToken = async (token: string) => {
	try {
		const jwt = await oauthIDTokenVerifier.verifyIdToken(token, okta.clientId);
		return jwt;
	} catch (error) {
		logger.error('Okta | ID Token | Verification Error', error);
	}
};

/**
 * Token cookie options
 */
const OAuthTokenCookieOptions: CookieOptions = {
	httpOnly: true,
	secure: !baseUri.includes('localhost'),
	signed: !baseUri.includes('localhost'),
	sameSite: 'lax',
};

/**
 * @name setOAuthTokenCookie
 *
 * Tells express to set the cookie response header for the
 * given OAuth token.
 *
 * This is stored on the browser as a Secure, HTTPOnly,
 * Signed, SameSite=lax.
 *
 * As it's only signed and not encrypted, no secret information
 * should be stored in the cookie. By signing the cookie
 * we can make sure that it hasn't been tampered by a
 * malicious actor. This is in addition to the fact that
 * the value is a JWT, which is also signed.
 *
 * @param {ResponseWithRequestState} res
 * @param {OAuthCookieNames} name
 * @param {string} value
 */
export const setOAuthTokenCookie = (
	res: ResponseWithRequestState,
	name: OAuthCookieNames,
	value: string,
): void => {
	res.cookie(name, value, {
		...OAuthTokenCookieOptions,
		maxAge: ms('1h'), // Expiry is set to 1 hour, which matches the token expiry
	});
};

/**
 * @name getOAuthTokenCookie
 *
 * Get a given OAuth Token cookie.
 *
 * If the cookie doesn't exist, or the signature failed
 * verification then `null` is returned.
 *
 * @param {Request} req
 * @param {OAuthCookieNames} name
 * @return {string | undefined}
 */
export const getOAuthTokenCookie = (
	req: Request,
	name: OAuthCookieNames,
): string | undefined => {
	// eslint-disable-next-line functional/no-let
	let cookieSource: 'cookies' | 'signedCookies';
	if (process.env.RUNNING_IN_CYPRESS === 'true') {
		// If we're in testing, first try reading from signedCookies,
		// and only then fall back to regular cookies.
		if (Object.keys(req.signedCookies).includes(name)) {
			cookieSource = 'signedCookies';
		} else {
			cookieSource = 'cookies';
		}
	} else {
		// If we're not in testing, always read from signedCookies.
		cookieSource = 'signedCookies';
	}
	return req?.[cookieSource]?.[name];
};

/**
 * @name deleteOAuthTokenCookie
 *
 * Delete an OAuth Token cookie.
 *
 * @param {ResponseWithRequestState} res
 * @param {OAuthCookieNames} name
 */
export const deleteOAuthTokenCookie = (
	res: ResponseWithRequestState,
	name: OAuthCookieNames,
): void => {
	res.clearCookie(name, OAuthTokenCookieOptions);
};

/**
 * @name checkAndDeleteOAuthTokenCookies
 * @description Check if the OAuth token cookies exist and delete them if they do
 *
 * @param req - Express request
 * @param res - Express response
 */
export const checkAndDeleteOAuthTokenCookies = (
	req: Request,
	res: ResponseWithRequestState,
): void => {
	const accessToken = getOAuthTokenCookie(req, OAuthAccessTokenCookieName);
	const idToken = getOAuthTokenCookie(req, OAuthIdTokenCookieName);

	if (accessToken) {
		deleteOAuthTokenCookie(res, OAuthAccessTokenCookieName);
	}

	if (idToken) {
		deleteOAuthTokenCookie(res, OAuthIdTokenCookieName);
	}
};
