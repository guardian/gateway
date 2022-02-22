/* eslint-disable functional/immutable-data */
import { Issuer, IssuerMetadata, Client } from 'openid-client';
import { randomBytes } from 'crypto';
import { Request, CookieOptions } from 'express';
import { joinUrl } from '@guardian/libs';
import { PersistableQueryParams } from '@/shared/model/QueryParams';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { getProfileUrl } from '@/server/lib/getProfileUrl';
import { ResponseWithRequestState } from '@/server/models/Express';
import { logger } from '@/server/lib/serverSideLogger';
import { RoutePaths } from '@/shared/model/Routes';

/**
 * An object to hold the state the user was in while performing the
 * Authorization Code flow.
 * - `stateParam` - Used as the `state` parameter in the Authorization Code Flow
 *   to prevent CSRF attacks
 *   - See "state" parameter details here:
 *   - https://developer.okta.com/docs/reference/api/oidc/#parameter-details
 * - `queryParams` - Query params that were used to start the flow,
 *   for example the returnUrl, tracking (ref, refViewId), clientId, etc.
 * @interface AuthorizationState
 */
interface AuthorizationState {
  stateParam: string;
  queryParams: PersistableQueryParams;
  confirmationPage?: RoutePaths;
}

/**
 * Subset of properties of the 'openid-client' Client class.
 * This is so we can support a minimal set of mechanisms for
 * things we actually need to use.
 *
 * @property `authorizationUrl` - Generate the `/authorize` url for the Authorization Code Flow (w or w/o PKCE)
 * @property `callbackParams` - Get OpenID Connect query parameters returned to the callback (redirect_uri)
 * @property `callback` - Method used in the callback (redirect_uri) endpoint to get OAuth tokens
 *
 * @interface OpenIdClient
 */

type OpenIdClient = Pick<
  Client,
  'authorizationUrl' | 'callbackParams' | 'callback'
>;

/**
 * Object of redirect URIs used by OAuth apps (clients)
 *
 * @interface OpenIdClientRedirectUris
 */
interface OpenIdClientRedirectUris {
  WEB: `${string}${Extract<'/oauth/authorization-code/callback', RoutePaths>}`;
}

const { okta, baseUri } = getConfiguration();

/**
 * https://developer.okta.com/docs/reference/api/oidc/#well-known-openid-configuration
 * this is part of the the metadata returned from the /.well-known/openid-configuration
 * used by openid-client to create the "Issuer" and "Client"
 * we only expose the endpoints here
 */
const issuer = joinUrl(okta.orgUrl, '/oauth2/', okta.authServerId);
const OIDC_METADATA: IssuerMetadata = {
  issuer,
  authorization_endpoint: joinUrl(issuer, '/v1/authorize'),
  token_endpoint: joinUrl(issuer, '/v1/token'),
  jwks_uri: joinUrl(issuer, '/v1/keys'),
  userinfo_endpoint: joinUrl(issuer, '/v1/userinfo'),
  registration_endpoint: joinUrl(issuer, '/oauth2/v1/clients'),
  introspection_endpoint: joinUrl(issuer, '/v1/introspect'),
  revocation_endpoint: joinUrl(issuer, '/v1/revoke'),
  end_session_endpoint: joinUrl(issuer, '/v1/logout'),
};

/**
 * Encapsulates a discovered or instantiated OpenID Connect Issuer (Issuer),
 * Identity Provider(IdP), Authorization Server(AS) and its metadata.
 */
const OIDCIssuer = new Issuer(OIDC_METADATA);

/**
 * Redirect uris used by the "profile" OAuth app in Okta
 * Currently only has the WEB redirect for profile
 * Native apps will likely have different redirect URIs
 */
export const ProfileOpenIdClientRedirectUris: OpenIdClientRedirectUris = {
  WEB: `${getProfileUrl()}/oauth/authorization-code/callback`,
};

/**
 * A subset of the 'openid-client' lib `Client` class
 * features/mechanisms to expose.
 * The client/app is the "profile" OAuth app in Okta
 * @property `authorizationUrl` - Generate the `/authorize` url for the Authorization Code Flow (w or w/o PKCE)
 * @property `callbackParams` - Get OpenID Connect query parameters returned to the callback (redirect_uri)
 * @property `oauthCallback` - Method used in the callback (redirect_uri) endpoint to get OAuth tokens
 */
export const ProfileOpenIdClient = new OIDCIssuer.Client({
  client_id: okta.clientId,
  client_secret: okta.clientSecret,
  redirect_uris: Object.values(ProfileOpenIdClientRedirectUris),
}) as OpenIdClient;

/**
 * Possible `error` types return by OpenID Connect and social login flows with okta
 * Sourced from https://developer.okta.com/docs/reference/error-codes/#example-errors-for-openid-connect-and-social-login
 */
export enum OpenIdErrors {
  UNAUTHORIZED_CLIENT = 'unauthorized_client',
  ACCESS_DENIED = 'access_denied',
  UNSUPPORTED_RESPONSE_TYPE = 'unsupported_response_type',
  INVALID_SCOPE = 'invalid_scope',
  SERVER_ERROR = 'server_error',
  TEMPORARILY_UNAVAILABLE = 'temporarily_unavailable',
  INVALID_CLIENT = 'invalid_client',
  LOGIN_REQUIRED = 'login_required',
  INVALID_REQUEST = 'invalid_request',
  USER_CANCELED_REQUEST = 'user_canceled_request',
}

/**
 * Generate a cryptographically secure random string to be used
 * as the `state` parameter in the authorization code flow
 * which is used as the state parameter value to prevent CSRF attacks.
 * @param {number} [bytes=16]
 * @return {string}
 */
const generateRandomString = (bytes = 16): string =>
  randomBytes(bytes).toString('hex');

/**
 * Type guard to check that the parsed cookie is actually
 * of type Authorization state
 *
 * @param {unknown} obj
 * @return {boolean}
 */
const isAuthorizationState = (obj: unknown): obj is AuthorizationState => {
  const objAsAuthState = obj as AuthorizationState;
  return !!(objAsAuthState.stateParam && objAsAuthState.queryParams);
};

/**
 * Generate the `AuthorizationState` object to be stored as a
 * cookie on the client, and the `stateParam` used by the Authorization
 * Code flow.
 * @param {string} returnUrl
 * @param confirmationPage (optional) - page to redirect the user to after authentication
 * @return {*} `AuthorizationState`
 */
export const generateAuthorizationState = (
  queryParams: PersistableQueryParams,
  confirmationPage?: RoutePaths,
): AuthorizationState => ({
  stateParam: generateRandomString(),
  queryParams,
  confirmationPage,
});

/**
 * Name of the Authorization State cookie to set
 * @type {string}
 */
const AuthorizationStateCookieName = 'GU_oidc_auth_state';

/**
 * Authorization state cookie options
 * No expiry/max-age, so cookie is deleted when browser session closes
 */
const AuthorizationStateCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: !baseUri.includes('localhost'),
  signed: !baseUri.includes('localhost'),
  sameSite: 'lax',
};

/**
 * Tells express to set the cookie response header for the
 * `AuthorizationState` The value is Base64 encoded. Name set
 * as `${AuthorizationStateCookieName}`.
 *
 * This is stored on the client as a Secure,
 * Signed, HTTPOnly, SameSite=lax, session cookie.
 * As it's only signed and not encrypted, no secret information
 * should be stored in the cookie. By signing the cookie
 * we can make sure that it hasn't been tampered by a malicious actor.
 * @param {AuthorizationState} state
 * @param {ResponseWithRequestState} res
 */
export const setAuthorizationStateCookie = (
  state: AuthorizationState,
  res: ResponseWithRequestState,
) => {
  try {
    res.cookie(
      AuthorizationStateCookieName,
      Buffer.from(JSON.stringify(state)).toString('base64'),
      AuthorizationStateCookieOptions,
    );
  } catch (error) {
    logger.error('setAuthorizationStateCookie Error', error);
  }
};

/**
 * Get the `AuthorizationState` cookie (${AuthorizationStateCookieName}).
 * If the cookie doesn't exist, or the signature failed
 * verification then `null` is returned.
 *
 * @param {Request} req
 * @return {*}  {(AuthorizationState | null)}
 */
export const getAuthorizationStateCookie = (
  req: Request,
): AuthorizationState | null => {
  const stateCookie = baseUri.includes('localhost')
    ? req.cookies[AuthorizationStateCookieName]
    : req.signedCookies[AuthorizationStateCookieName];
  if (!stateCookie) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(stateCookie, 'base64').toString('utf-8'),
    );

    if (isAuthorizationState(parsed)) {
      return parsed;
    }

    return null;
  } catch (error) {
    logger.error('getAuthorizationStateCookie Error', error);
    return null;
  }
};

/**
 * Delete the `AuthorizationState` cookie (`${AuthorizationStateCookieName}`).
 * This should be called once the Authorization Code Flow is complete
 * as the cookie has been used and no longer required.
 * @param {ResponseWithRequestState} res
 */
export const deleteAuthorizationStateCookie = (
  res: ResponseWithRequestState,
) => {
  // Web browsers and other compliant clients will only clear the cookie
  // if the given options is identical to those given to res.cookie()
  // excluding expires and maxAge.
  res.clearCookie(
    AuthorizationStateCookieName,
    AuthorizationStateCookieOptions,
  );
};
