import {
	Configuration,
	ServerMetadata,
	buildAuthorizationUrl,
	authorizationCodeGrant,
	refreshTokenGrant,
	customFetch,
	type IDToken,
} from 'openid-client';
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

export type UserFlow =
	| 'sign-in-passcode'
	| 'sign-in-password'
	| 'social-registration'
	| 'social-sign-in'
	| 'social-authentication'
	| 'google-one-tap'
	| 'create-account'
	| 'account-recovery';
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
		codeVerifier?: string; // used to track the code verifier used in the PKCE flow
		stateToken?: string; // state handle from Okta IDX /introspect response but only everything before the first tilde (`stateHandle.split('~')[0]`), used to redirect user to login redirect endpoint to set global session (`/login/token/redirect?stateToken=${stateToken}`)
		// used to track the flow the user is in for basic metrics/analytics
		flow?: UserFlow; // password reset, and email verification flows outside of create account
		appLabel?: string; // used to track the app used to start the flow
	};
}

/**
 * @interface OidcTokenSet
 *
 * Replaces the v5 `TokenSet` class. Wraps the v6 `TokenEndpointResponse` plain
 * object and adds back a `claims()` helper so that callers in oauth.ts do not
 * need to change how they access ID-token claims.
 */
export interface OidcTokenSet {
	access_token?: string;
	id_token?: string;
	refresh_token?: string;
	token_type?: string;
	expires_in?: number;
	scope?: string;
	/**
	 * Returns the validated ID-token claims extracted from the token response.
	 * Equivalent to v5's `tokenSet.claims()`.
	 */
	claims: () => IDToken;
}

/**
 * @interface OpenIdClient
 *
 * Internal abstraction over the openid-client library.  Exposes only the four
 * operations that Gateway actually uses so that the rest of the codebase is
 * isolated from library internals.
 *
 * @property `authorizationUrl`  - Build the /authorize redirect URL
 * @property `callbackParams`    - Parse OIDC params from the callback request
 * @property `callback`          - Exchange an authorisation code for tokens
 * @property `refresh`           - Use a refresh token to obtain new tokens
 */
export interface OpenIdClient {
	authorizationUrl(params: Record<string, string | undefined>): string;
	callbackParams(req: Request): Record<string, string>;
	callback(
		redirectUri: string,
		params: Record<string, string>,
		checks: {
			response_type?: string;
			state?: string;
			code_verifier?: string;
		},
	): Promise<OidcTokenSet>;
	refresh(refreshToken: string): Promise<OidcTokenSet>;
}

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
const OIDC_METADATA: ServerMetadata = {
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
 * @function decodeIdTokenClaims
 *
 * Decodes the claims from a validated JWT ID token by base64url-decoding the
 * payload segment. The token's signature has already been cryptographically
 * verified by `authorizationCodeGrant` / `refreshTokenGrant`, so re-verifying
 * here is not necessary.
 */
const decodeIdTokenClaims = (idToken: string): IDToken => {
	const [, payload] = idToken.split('.');
	return JSON.parse(
		Buffer.from(payload, 'base64url').toString('utf-8'),
	) as IDToken;
};

/**
 * @function buildProfileConfig
 *
 * Creates a v6 `Configuration` object that combines server metadata with
 * client credentials.  When an IP address is provided, a custom `fetch`
 * implementation is attached so that every outgoing request to Okta carries
 * an `X-Forwarded-For` header.  This lets Okta apply per-user rate-limiting
 * and fraud detection instead of treating all requests as coming from the
 * gateway's own IP.
 *
 * Replaces: `new Issuer(metadata)` + `new issuer.Client({...})` + `client[custom.http_options]`
 */
const buildProfileConfig = (
	serverMetadata: ServerMetadata,
	ip?: string,
): Configuration => {
	const config = new Configuration(serverMetadata, okta.clientId, {
		client_secret: okta.clientSecret,
	});

	if (ip) {
		// Attach a custom fetch implementation that injects the user's IP.
		// This replaces the v5 `client[custom.http_options]` hook.
		// The v6 library uses the Web Fetch API internally, so headers are
		// a plain object / HeadersInit rather than Node.js OutgoingHttpHeaders.
		// We use `any` for `options` because v6's internal `CustomFetchOptions`
		// is not publicly exported and its `body` type is broader than RequestInit.
		// The cast to the config's property type keeps the assignment type-safe.
		// eslint-disable-next-line functional/immutable-data -- required to attach customFetch symbol to the Configuration instance
		config[customFetch] = ((
			url: URL | string,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any -- CustomFetchOptions is not a public export; using any avoids the FetchBody vs BodyInit incompatibility
			options: any,
		): Promise<Response> =>
			fetch(url, {
				...options,
				headers: {
					...Object.fromEntries(new Headers(options?.headers ?? {})),
					'X-Forwarded-For': ip,
				},
			})) as NonNullable<Configuration[typeof customFetch]>;
	}

	return config;
};

/**
 * @function makeOpenIdClient
 *
 * Wraps a v6 `Configuration` in the `OpenIdClient` interface that the rest of
 * the application expects.  The four methods mirror the v5 `Client` instance
 * methods so that callers in oauth.ts do not need to change.
 *
 * Key differences handled internally:
 * - `authorizationUrl`  → `buildAuthorizationUrl(config, params)`
 * - `callbackParams`    → parse Express `req.query` into a plain string map
 * - `callback`          → `authorizationCodeGrant(config, url, checks)`
 * - `refresh`           → `refreshTokenGrant(config, token)`
 * - `claims()`          → `getValidatedIdTokenClaims(response)` re-added as a
 *                         method on the returned token object for backward compat
 */
const makeOpenIdClient = (config: Configuration): OpenIdClient => ({
	authorizationUrl(params) {
		const definedEntries = Object.entries(params).filter(
			(e): e is [string, string] => e[1] !== undefined,
		);
		return buildAuthorizationUrl(config, new URLSearchParams(definedEntries))
			.href;
	},

	callbackParams(req) {
		// Parse the query string from the Express request into a flat string map.
		// This preserves error params (error, error_description) so that the
		// existing isOAuthError() check in the route handler still works.
		const raw = (req.query ?? {}) as Record<string, unknown>;
		return Object.fromEntries(
			Object.entries(raw).filter(
				(e): e is [string, string] => typeof e[1] === 'string',
			),
		);
	},

	async callback(redirectUri, params, checks) {
		// Reconstruct the full callback URL so that authorizationCodeGrant can
		// parse and validate the response in one step.
		const callbackUrl = new URL(redirectUri);
		Object.entries(params).forEach(([k, v]) =>
			callbackUrl.searchParams.set(k, v),
		);

		const response = await authorizationCodeGrant(config, callbackUrl, {
			pkceCodeVerifier: checks.code_verifier,
			expectedState: checks.state,
		});

		// Re-attach claims() so callers don't need to change.
		// decodeIdTokenClaims reads the JWT payload that the library already
		// validated during the grant; it does not re-verify the signature.
		return {
			...response,
			claims: (): IDToken =>
				response.id_token
					? decodeIdTokenClaims(response.id_token)
					: ({} as IDToken),
		};
	},

	async refresh(refreshToken) {
		const response = await refreshTokenGrant(config, refreshToken);
		return {
			...response,
			claims: (): IDToken =>
				response.id_token
					? decodeIdTokenClaims(response.id_token)
					: ({} as IDToken),
		};
	},
});

/**
 * @function ProfileOpenIdClient
 *
 * Returns an `OpenIdClient` backed by the production Okta OIDC configuration.
 */
const ProfileOpenIdClient = (ip?: string): OpenIdClient => {
	const config = buildProfileConfig(OIDC_METADATA, ip);
	return makeOpenIdClient(config);
};

/**
 * @function DevProfileIdClient
 *
 * DEV ONLY
 *
 * In local development the Gateway runs at profile.thegulocal.com while Okta
 * tokens carry the real Okta org URL as their issuer.  This function generates
 * a Configuration whose issuer URL matches the Okta domain so that token
 * validation succeeds even though the redirect_uri uses the local domain.
 *
 * @param devIssuer - The Okta-domain issuer string extracted from X-GU-Okta-Env
 * @param {string} [ip] - Optional user IP address forwarded to Okta as X-Forwarded-For
 */
const DevProfileIdClient = (devIssuer: string, ip?: string): OpenIdClient => {
	const devMetadata: ServerMetadata = {
		...OIDC_METADATA,
		issuer: issuer.replace(okta.orgUrl.replace('https://', ''), devIssuer),
	};
	const config = buildProfileConfig(devMetadata, ip);
	return makeOpenIdClient(config);
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
		return DevProfileIdClient(req.get('X-GU-Okta-Env') as string, req.ip);
	}

	return ProfileOpenIdClient(req.ip);
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
 *
 * @param queryParams - Persistable query params captured at flow start
 * @param confirmationPage (optional) - page to redirect the user to after authentication
 * @param doNotSetLastAccessCookie (optional) - if true, ignore the last access cookie when setting the other Idapi cookies
 * @param data (optional) - additional non-sensitive state data to carry through the flow
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
		logger.error('setAuthorizationStateCookie Error', error);
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
		logger.error('getAuthorizationStateCookie Error', error);
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
