/* eslint-disable functional/immutable-data */
import { Issuer, Client, custom } from 'openid-client';
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
 * Class to wrap the openid-client.
 * Since the methods provided by that client are asynchronous,
 * and we need to use the values (`Issuer`/`Client`) returned by the async method,
 * the class lets us initialise the values when `instantiate` is called
 * making the values `Issuer` and `Client` available anywhere which references
 * the instance of this class
 * @class OktaOIDCHandler
 */
class OktaOIDCHandler {
  private issuer!: Issuer<Client>;
  private client!: Client;

  /**
   * Encapsulates a discovered or instantiated OpenID Connect Issuer (Issuer),
   * Identity Provider (IdP), Authorization Server (AS) and its metadata.
   * @readonly
   * @type {Issuer<Client>}
   * @memberof OktaOIDCHandler
   */
  get Issuer() {
    if (!this.issuer) {
      throw new Error(
        'Issuer not found. Did you call the `instantiate` method first?',
      );
    }
    return this.issuer;
  }

  /**
   * Encapsulates a dynamically registered, discovered or instantiated OpenID
   * Connect Client (Client), Relying Party (RP), and its metadata, its instances
   * hold the methods for getting an authorization URL, consuming callbacks,
   * triggering token endpoint grants, revoking and introspecting tokens.
   * @readonly
   * @type {Client}
   * @memberof OktaOIDCHandler
   */
  get Client() {
    if (!this.client) {
      throw new Error(
        'Client not found. Did you call the `instantiate` method first?',
      );
    }
    return this.client;
  }

  /**
   * To initalise the values of `Issuer` and `Client` by calling,
   * and retrieving the value of the oidc-client `Issuer.discover` method.
   * This should be called on app launch. If an error is thrown, the
   * app should not start.
   * @memberof OktaOIDCHandler
   */
  async instantiate() {
    try {
      const issuer = await Issuer.discover(
        `${oktaDomain}/oauth2/${oktaCustomOAuthServer}/`,
      );
      const client = new issuer.Client({
        client_id: oktaClientId,
        client_secret: oktaClientSecret,
        redirect_uris: [`${getProfileUrl()}${Routes.OAUTH_AUTH_CODE_CALLBACK}`],
      });

      this.issuer = issuer;
      this.client = client;

      logger.info('Okta OpenID Connect handler initialised');
    } catch (error) {
      logger.info('Okta OpenID Connect handler failed to initialise.');
      throw error;
    }
  }
}

/**
 * An instance of this class which will be used anywhere
 * we need to make okta oauth/oidc calls.
 * @return {*} `OktaOIDCHandler`
 */
export const OktaOIDC = new OktaOIDCHandler();

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
const AuthorizationStateCookieName = 'oidc_auth_state';

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
    return JSON.parse(Buffer.from(stateCookie, 'base64').toString('utf-8'));
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
