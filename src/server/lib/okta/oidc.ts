/* eslint-disable functional/immutable-data */
import { Issuer, custom, IssuerMetadata, Client } from 'openid-client';
import { randomBytes } from 'crypto';
import { Request } from 'express';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { getProfileUrl } from '@/server/lib/getProfileUrl';
import { Routes } from '@/shared/model/Routes';
import { httpsAgent } from '@/server/lib/devHttpsAgent';
import { ResponseWithRequestState } from '@/server/models/Express';
import { logger } from '@/server/lib/logger';

/**
 * An object to hold the state the user was in while performing the
 * Authorization Code flow.
 * - `nonce` - Used as the `state` parameter in the Authorization Code Flow
 *   to prevent CSRF attacks
 * - `returnUrl` - The URL of the page/article/etc. that the user was on
 *   before landing on the sign in page, so we can redirect them back there
 *   once successfully authenticated
 * @interface AuthorizationState
 */
interface AuthorizationState {
  nonce: string;
  returnUrl: string;
}

/**
 * Subset of properties of the 'openid-client' Client class.
 * This is so we can support a minimal set of mechanisms for
 * things we actually need to use.
 *
 * @interface OpenIdClient
 */
interface OpenIdClient {
  authorizationUrl: Client['authorizationUrl'];
  callbackParams: Client['callbackParams'];
  oauthCallback: Client['oauthCallback'];
  redirectUris: OpenIdClientRedirectUris;
}

/**
 * Object of redirect URIs used by OAuth apps (clients)
 *
 * @interface OpenIdClientRedirectUris
 */
interface OpenIdClientRedirectUris {
  WEB: string;
}

const { oktaDomain, oktaClientId, oktaClientSecret, oktaCustomOAuthServer } =
  getConfiguration();

// An agent to use with http calls to disable ssl verification in DEV only
// for *.thegulocal.com domains
custom.setHttpOptionsDefaults({
  agent: {
    https: httpsAgent,
  },
});

/**
 * https://developer.okta.com/docs/reference/api/oidc/#well-known-openid-configuration
 * this is part of the the metadata returned from the /.well-known/openid-configuration
 * used by openid-client to create the "Issuer" and "Client"
 * we only expose the endpoints here
 */
const OIDC_METADATA: IssuerMetadata = {
  issuer: `${oktaDomain}/oauth2/${oktaCustomOAuthServer}`,
  authorization_endpoint: `${oktaDomain}/oauth2/${oktaCustomOAuthServer}/v1/authorize`,
  token_endpoint: `${oktaDomain}/oauth2/${oktaCustomOAuthServer}/v1/token`,
  jwks_uri: `${oktaDomain}/oauth2/${oktaCustomOAuthServer}/v1/keys`,
  userinfo_endpoint: `${oktaDomain}/oauth2/${oktaCustomOAuthServer}/v1/userinfo`,
  registration_endpoint: `${oktaDomain}/oauth2/v1/clients`,
  introspection_endpoint: `${oktaDomain}/oauth2/${oktaCustomOAuthServer}/v1/introspect`,
  revocation_endpoint: `${oktaDomain}/oauth2/${oktaCustomOAuthServer}/v1/revoke`,
  end_session_endpoint: `${oktaDomain}/oauth2/${oktaCustomOAuthServer}/v1/logout`,
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
const OIDCProfileClientRedirectUris: OpenIdClientRedirectUris = {
  WEB: `${getProfileUrl()}${Routes.OAUTH_AUTH_CODE_CALLBACK}`,
};

/**
 * Encapsulates a dynamically registered, discovered or instantiated
 * OpenID Connect Client(Client), Relying Party(RP), and its metadata,
 * its instances hold the methods for getting an authorization URL,
 * consuming callbacks, triggering token endpoint grants, revoking and
 * introspecting tokens.
 *
 * This variable is set to the "profile" OAuth app in Okta, with it's
 * client id and secret
 */
const OIDCProfileClient = new OIDCIssuer.Client({
  client_id: oktaClientId,
  client_secret: oktaClientSecret,
  redirect_uris: Object.values(OIDCProfileClientRedirectUris),
});

/**
 * A subset of the 'openid-client' lib `Client` class
 * features/mechanisms to expose.
 * The client/app is the "profile" OAuth app in Okta
 * @property `authorizationUrl` - Generate the `/authorize` url for the Authorization Code Flow (w or w/o PKCE)
 * @property `callbackParams` - Get OpenID Connect query parameters returned to the callback (redirect_uri)
 * @property `oauthCallback` - Method used in the callback (redirect_uri) endpoint to get OAuth tokens
 * @property `redirect_uris` - Array of redirect URIs in the OAuth app, from `OIDCProfileClientRedirectUris`
 */
export const ProfileOpenIdClient: OpenIdClient = {
  authorizationUrl: OIDCProfileClient.authorizationUrl,
  callbackParams: OIDCProfileClient.callbackParams,
  oauthCallback: OIDCProfileClient.oauthCallback,
  redirectUris: OIDCProfileClientRedirectUris,
};

/**
 * Generate a cryptographically secure random string to be used
 * as the `state` parameter in the authorization code flow
 * which is used as a nonce value to prevent CSRF attacks.
 * @param {number} [bytes=16]
 * @return {string}
 */
const generateNonce = (bytes = 16): string =>
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
  return !!(objAsAuthState.nonce && objAsAuthState.returnUrl);
};

/**
 * Generate the `AuthorizationState` object to be stored as a
 * cookie on the client, and the `nonce` used by the Authorization
 * Code flow.
 * @param {string} returnUrl
 * @return {*} `AuthorizationState`
 */
export const generateAuthorizationState = (
  returnUrl: string,
): AuthorizationState => ({
  nonce: generateNonce(),
  returnUrl,
});

/**
 * Name of the Authorization State cookie to set
 * @type {string}
 */
const AuthorizationStateCookieName = 'GU_oidc_auth_state';

/**
 * Tells express to set the cookie response header for the
 * `AuthorizationState` The value is Base64 encoded. Name set
 * as `${AuthorizationStateCookieName}`.
 *
 * This is stored on the client as a Secure,
 * Signed, HTTPOnly, SameSite=strict, session cookie.
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
      {
        httpOnly: true,
        secure: true,
        signed: true,
        sameSite: 'strict',
      },
    );
  } catch (error) {
    logger.warn(error);
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
  const stateCookie = req.signedCookies[AuthorizationStateCookieName];

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
    logger.warn(error);
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
  // http specification has no way of deleting cookies
  // so a workaround is to set the cookie expiry to now
  res.cookie(AuthorizationStateCookieName, '', {
    expires: new Date(),
  });
};
