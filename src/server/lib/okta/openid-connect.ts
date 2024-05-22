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
import { SocialProvider } from '@/shared/model/Social';
import { SignInGateIdsForOfferEmails } from '@/server/lib/ophan';

/**
 * @interface AuthorizationState
 * An object to hold the state the user was in while performing the
 * Authorization Code flow.
 * - `stateParam` - Used as the `state` parameter in the Authorization Code Flow
 *   to prevent CSRF attacks
 *   - See "state" parameter details here:
 *   - https://developer.okta.com/docs/reference/api/oidc/#parameter-details
 * - `queryParams` - Query params that were used to start the flow,
 *   for example the returnUrl, tracking (ref, refViewId), clientId, etc.
 * - `data` - any extra data that needs to be persisted between the start and
 *   end of the authorization code flow, only use for small, non-sensitive data.
 *   For sensitive data, see the EncryptedStateCookie.
 */
export interface AuthorizationState {
	stateParam: string;
	queryParams: PersistableQueryParams;
	confirmationPage?: RoutePaths;
	doNotSetLastAccessCookie?: boolean;
	data?: {
		isEmailRegistration?: boolean; // set only on /welcome/:token to track if user is registering with email
		deleteReason?: string; // used to track the reason for self service deletion
		encryptedRegistrationConsents?: string; // used to set the consents given during registration on the authentication callback when we have oauth access tokens which can update the user's consents in idapi, should be encrypted, and decrypted on the callback
		socialProvider?: SocialProvider; // used to track the social provider used to sign in/register
		appPrefix?: string; // used to track if the recovery token has a native app prefix
		signInGateId?: SignInGateIdsForOfferEmails; // used to track the sign in gate id
		codeVerifier?: string; // used to track the code verifier used in the PKCE flow
		stateToken?: string; // state handle from Okta IDX /introspect response but only everything before the first tilde (`stateHandle.split('~')[0]`), used to redirect user to login redirect endpoint to set global session (`/login/token/redirect?stateToken=${stateToken}`)
	};
}

/**
 * @interface OpenIdClient
 * Subset of properties of the 'openid-client' Client class.
 * This is so we can support a minimal set of mechanisms for
 * things we actually need to use.
 *
 * @property `authorizationUrl` - Generate the `/authorize` url for the Authorization Code Flow (w or w/o PKCE)
 * @property `callbackParams` - Get OpenID Connect query parameters returned to the callback (redirect_uri)
 * @property `callback` - Method used in the callback (redirect_uri) endpoint to get OAuth tokens
 * @property `refresh` - Method used to refresh the OAuth tokens using a refresh token
 *
 */

export type OpenIdClient = Pick<
	Client,
	'authorizationUrl' | 'callbackParams' | 'callback' | 'refresh'
>;

/**
 * @interface OpenIdClientRedirectUris
 *
 * Object of redirect URIs used by OAuth apps (clients)
 */
interface OpenIdClientRedirectUris {
	AUTHENTICATION: `${string}${Extract<
		'/oauth/authorization-code/callback',
		RoutePaths
	>}`;
	APPLICATION: `${string}${Extract<
		'/oauth/authorization-code/application-callback',
		RoutePaths
	>}`;
	DELETE: `${string}${Extract<
		'/oauth/authorization-code/delete-callback',
		RoutePaths
	>}`;
	INTERACTION_CODE: `${string}${Extract<
		'/oauth/authorization-code/interaction-code-callback',
		RoutePaths
	>}`;
}

const { okta, baseUri, stage } = getConfiguration();

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
 * @property `AUTHENTICATION` - Used to redirect for authentication related flows (e.g. sign in, register, reset password etc.)
 * @property `APPLICATION` - Used to get tokens for use within the gateway application (e.g. onboarding flow)
 */
export const ProfileOpenIdClientRedirectUris: OpenIdClientRedirectUris = {
	AUTHENTICATION: `${getProfileUrl()}/oauth/authorization-code/callback`,
	APPLICATION: `${getProfileUrl()}/oauth/authorization-code/application-callback`,
	DELETE: `${getProfileUrl()}/oauth/authorization-code/delete-callback`,
	INTERACTION_CODE: `${getProfileUrl()}/oauth/authorization-code/interaction-code-callback`,
};

/**
 * @class ProfileOpenIdClient
 *
 * A subset of the 'openid-client' lib `Client` class
 * features/mechanisms to expose.
 * The client/app is the "profile" OAuth app in Okta
 * @property `authorizationUrl` - Generate the `/authorize` url for the Authorization Code Flow (w or w/o PKCE)
 * @property `callbackParams` - Get OpenID Connect query parameters returned to the callback (redirect_uri)
 * @property `oauthCallback` - Method used in the callback (redirect_uri) endpoint to get OAuth tokens
 */
const ProfileOpenIdClient = new OIDCIssuer.Client({
	client_id: okta.clientId,
	client_secret: okta.clientSecret,
	redirect_uris: Object.values(ProfileOpenIdClientRedirectUris),
}) as OpenIdClient;

/**
 * @class DevProfileIdClient
 *
 * DEV ONLY
 *
 * Generates a new issuer per request in dev env to simulate
 * custom domain as the issuer
 * this is because locally the issuer is probably profile.thegulocal.com
 * while okta tokens will be the okta url, so we need to replace the issuer
 * with the okta domain
 * @param devIssuer - The okta domain issuer url to use for development
 */
const DevProfileIdClient = (devIssuer: string) => {
	const devOidcIssuer = new Issuer({
		...OIDC_METADATA,
		issuer: issuer.replace(okta.orgUrl.replace('https://', ''), devIssuer),
	});

	return new devOidcIssuer.Client({
		client_id: okta.clientId,
		client_secret: okta.clientSecret,
		redirect_uris: Object.values(ProfileOpenIdClientRedirectUris),
	}) as OpenIdClient;
};

/**
 * @function getOpenIdClient
 *
 * Used to determine which OpenIdClient to get based on the stage and headers
 * In development, we use the dev issuer to simulate a custom domain, so we
 * want the DevProfileIdClient
 * In production, we use the production issuer, so we want the ProfileOpenIdClient
 *
 * @param req Express request
 * @returns OpenIdClient
 */
export const getOpenIdClient = (req: Request): OpenIdClient => {
	if (stage === 'DEV' && req.get('X-GU-Okta-Env')) {
		return DevProfileIdClient(req.get('X-GU-Okta-Env') as string);
	}
	return ProfileOpenIdClient;
};

/**
 * @function generateRandomString
 *
 * Generate a cryptographically secure random string to be used
 * as the `state` parameter in the authorization code flow
 * which is used as the state parameter value to prevent CSRF attacks.
 * @param {number} [bytes=16]
 * @return {string}
 */
const generateRandomString = (bytes = 16): string =>
	randomBytes(bytes).toString('hex');

/**
 * @function isAuthorizationState
 *
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
 * @function generateAuthorizationState
 *
 * Generate the `AuthorizationState` object to be stored as a
 * cookie on the client, and the `stateParam` used by the Authorization
 * Code flow.
 * @param {string} returnUrl
 * @param confirmationPage (optional) - page to redirect the user to after authentication
 * @param doNotSetLastAccessCookie (optional) - if true, ignore the last access cookie when setting the other Idapi cookies
 * @return {*} `AuthorizationState`
 */
export const generateAuthorizationState = (
	queryParams: PersistableQueryParams,
	confirmationPage?: RoutePaths,
	doNotSetLastAccessCookie?: boolean,
	data?: AuthorizationState['data'],
): AuthorizationState => ({
	stateParam: generateRandomString(),
	queryParams,
	confirmationPage,
	doNotSetLastAccessCookie,
	data,
});

/**
 * @function updateAuthorizationStateData
 *
 * Update the `AuthorizationState` data with the provided data, useful for adding extra data
 * after the initial state has been generated.
 *
 * @param {AuthorizationState} state
 * @param {AuthorizationState['data']} data
 * @return {*}  {AuthorizationState}
 */
export const updateAuthorizationStateData = (
	state: AuthorizationState,
	data: Partial<AuthorizationState['data']>,
): AuthorizationState => ({
	...state,
	data: {
		...state.data,
		...data,
	},
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
 * @name setAuthorizationStateCookie
 *
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
		logger.error('setAuthorizationStateCookie Error', error, {
			request_id: res.locals.requestId,
		});
	}
};

/**
 * @name getAuthorizationStateCookie
 *
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
		logger.error('getAuthorizationStateCookie Error', error, {
			request_id: req.get('x-request-id'),
		});
		return null;
	}
};

/**
 * @name deleteAuthorizationStateCookie
 *
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
