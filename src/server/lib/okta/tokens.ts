import { Request, CookieOptions } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import OktaJwtVerifier from '@okta/jwt-verifier';
import { joinUrl } from '@guardian/libs';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from '@/server/lib/serverSideLogger';

/**
 * Configuration
 */
const { okta } = getConfiguration();

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

/**
 * @name oauthTokenVerifier
 * @type {OktaJwtVerifier}
 * @description Okta JWT Verifier
 */
const oauthTokenVerifier = new OktaJwtVerifier({
  issuer: joinUrl(
    'https://profile.code.dev-theguardian.com',
    '/oauth2/',
    okta.authServerId,
  ),
});

export const verifyAccessToken = async (token: string) => {
  try {
    const jwt = await oauthTokenVerifier.verifyAccessToken(
      token,
      'https://profile.code.dev-theguardian.com/',
    );
    return jwt;
  } catch (error) {
    logger.error('Okta | Access Token | Verification Error', error);
  }
};

export const verifyIdToken = async (token: string) => {
  try {
    const jwt = await oauthTokenVerifier.verifyIdToken(token, okta.clientId);
    return jwt;
  } catch (error) {
    logger.error('Okta | ID Token | Verification Error', error);
  }
};

/**
 * Token cookie options
 * Expiry is set to 1 hour by default, which matches the token expiry
 */
const OAuthTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: true,
  signed: true,
  sameSite: 'lax',
  maxAge: 3600000,
});

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
  res.cookie(name, value, OAuthTokenCookieOptions());
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
  return req.signedCookies[name];
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
  res.clearCookie(name, OAuthTokenCookieOptions());
};
