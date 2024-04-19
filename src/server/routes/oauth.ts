import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import {
	AuthorizationState,
	deleteAuthorizationStateCookie,
	getAuthorizationStateCookie,
	getOpenIdClient,
	ProfileOpenIdClientRedirectUris,
	OpenIdClient,
} from '@/server/lib/okta/openid-connect';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { exchangeAccessTokenForCookies } from '@/server/lib/idapi/auth';
import { setIDAPICookies } from '@/server/lib/idapi/IDAPICookies';
import {
	FederationErrors,
	GenericErrors,
	RegistrationErrors,
	SignInErrors,
} from '@/shared/model/Errors';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { IdTokenClaims, TokenSet } from 'openid-client';
import { updateUser } from '@/server/lib/okta/api/users';
import { setUserFeatureCookies } from '@/server/lib/user-features';
import { consentPages } from './consents';
import {
	checkAndDeleteOAuthTokenCookies,
	setOAuthTokenCookie,
} from '@/server/lib/okta/tokens';
import { getConfiguration } from '@/server/lib/getConfiguration';
import {
	OpenIdErrors,
	OpenIdErrorDescriptions,
} from '@/shared/model/OpenIdErrors';
import { update as updateConsents } from '@/server/lib/idapi/consents';
import { decryptRegistrationConsents } from '@/server/lib/registrationConsents';
import { SocialProvider } from '@/shared/model/Social';
import {
	touchBraze,
	update as updateNewsletters,
} from '@/server/lib/idapi/newsletters';
import { RoutePaths } from '@/shared/model/Routes';
import { sendGuardianLiveOfferEmail } from '@/email/templates/GuardianLiveOffer/sendGuardianLiveOfferEmail';
import { sendMyGuardianOfferEmail } from '@/email/templates/MyGuardianOffer/sendMyGuardianOfferEmail';
import { emailSendMetric } from '../models/Metrics';

const { baseUri, deleteAccountStepFunction } = getConfiguration();

interface OAuthError {
	error: string;
	error_description: string;
}

interface CustomClaims extends IdTokenClaims {
	user_groups?: string[];
	email_validated?: boolean;
}

/**
 * Type guard to check that a given error is an OAuth error.
 * By checking for the `error` and `error_description` properties
 * @param {unknown} obj
 * @return {boolean}
 */
const isOAuthError = (
	maybeOAuthError: unknown,
): maybeOAuthError is OAuthError => {
	const { error, error_description } = maybeOAuthError as OAuthError;
	return error !== undefined && error_description !== undefined;
};

/**
 * Helper method to redirect back to the sign in page with
 * a generic error message if we don't want to expose the error
 * back to the client. Be sure to log the error though!
 */
const redirectForGenericError = (_: Request, res: ResponseWithRequestState) => {
	return res.redirect(
		addQueryParamsToPath('/signin', res.locals.queryParams, {
			error_description: SignInErrors.GENERIC,
		}),
	);
};

/**
 * A recursive function which waits for the legacy_identity_id claim
 * to be present in the access token during a succession of token
 * refreshes.
 */
const waitForLegacyIdentityId = async (
	openIdClient: OpenIdClient,
	tokenSet: TokenSet,
	refreshToken: string,
	maximumWaitTime = 30000,
	waitTime = 500,
): Promise<TokenSet | null> => {
	const { legacy_identity_id } = tokenSet.claims();

	if (legacy_identity_id) {
		// The legacy_identity_id claim is present, we can return the token set
		return tokenSet;
	}

	if (maximumWaitTime <= 0) {
		// We've timed out waiting for the claim to be present
		return null;
	}

	const start = Date.now();
	const refreshedTokenSet = await openIdClient.refresh(refreshToken);
	const newRefreshToken = refreshedTokenSet?.refresh_token;
	if (!newRefreshToken) {
		// There's no refresh token in this token set, so we can't continue
		return null;
	}

	// Non-blocking wait for the next iteration
	return new Promise((resolve) => {
		setTimeout(async () => {
			const remainingTime = maximumWaitTime - (Date.now() - start);
			resolve(
				await waitForLegacyIdentityId(
					openIdClient,
					refreshedTokenSet,
					newRefreshToken,
					remainingTime,
					waitTime,
				),
			);
		}, waitTime);
	});
};

/**
 * @route GET /oauth/authorization-code/callback
 *
 * Route to use after Authorization Code flow for Authentication related requests
 * e.g sign in, register, reset password, etc
 *
 * Has a bunch of logic related to that, e.g. checking user groups, getting idapi cookies,
 * setting ad-free cookie, etc. and the token it gets back is the short lived,
 * one which we don't want to store anywhere.
 */
const authenticationHandler = async (
	req: Request,
	res: ResponseWithRequestState,
	tokenSet: TokenSet,
	authState: AuthorizationState,
) => {
	try {
		/**
		 * Cypress Test START
		 *
		 * This code checks if we're running in Cypress
		 */
		const runningInCypress = process.env.RUNNING_IN_CYPRESS === 'true';
		const cypressMockStateCookie = req.cookies['cypress-mock-state'];
		/**
		 * Cypress Test END
		 */

		// this is just to handle potential errors where we don't get back an access token
		if (!tokenSet.access_token) {
			logger.error(
				'Missing access_token from /token endpoint in OAuth Callback',
				undefined,
				{
					request_id: res.locals.requestId,
				},
			);
			trackMetric('OAuthAuthenticationCallback::Failure');
			return redirectForGenericError(req, res);
		}

		// We're unable to set the user.emailValidated field in the Okta user profile
		// for social users when they are created, but we are able to put them in the
		// GuardianUser-EmailValidated group.
		// So this is a workaround to set the emailValidated field to true in the Okta user profile
		// if the user is in the GuardianUser-EmailValidated group, based on custom claims we have
		// set up on the id_token.
		// This scenario only occurs in the case of new social users, as existing users will have
		// the emailValidated field set to true in their Okta user profile.
		// So we can use this functionality to show the onboarding flow for new social users, as
		// there is no other trivial way to do this.
		// eslint-disable-next-line functional/no-let
		let isSocialRegistration = false;
		if (tokenSet.id_token) {
			// extracting the custom claims from the id_token and the sub (user id)
			const { user_groups, email_validated, sub, email } =
				tokenSet.claims() as CustomClaims;
			// if the user is in the GuardianUser-EmailValidated group, but the emailValidated field is falsy
			// then we set the emailValidated field to true in the Okta user profile by manually updating the user
			if (
				!email_validated &&
				user_groups?.some((group) => group === 'GuardianUser-EmailValidated')
			) {
				isSocialRegistration = true;

				// We now know this user is registering a new Guardian account with social

				// updated the user profile emailValidated to true
				await updateUser(sub, { profile: { emailValidated: true } });

				/* AB TEST START */

				// If the user signed up from one of the sign in gates we're AB testing, we want to send them
				// the appropriate email
				const signInGateId = authState.data?.signInGateId;
				if (signInGateId && email) {
					switch (signInGateId) {
						case 'alternative-wording-guardian-live': {
							const emailIsSent = await sendGuardianLiveOfferEmail({
								to: email,
							});
							trackMetric(
								emailSendMetric(
									'GuardianLiveOffer',
									emailIsSent ? 'Success' : 'Failure',
								),
							);
							break;
						}
						case 'alternative-wording-personalise': {
							const emailIsSent = await sendMyGuardianOfferEmail({
								to: email,
							});
							trackMetric(
								emailSendMetric(
									'MyGuardianOffer',
									emailIsSent ? 'Success' : 'Failure',
								),
							);
							break;
						}
						default:
							break;
					}
				}
				/* AB TEST END */

				// since this is a new social user, we want to show the onboarding flow too
				// we use the `confirmationPage` flag to redirect the user to the onboarding/consents page
				if (
					authState.data?.socialProvider ||
					// Cypress Test START
					// this is a special case for the cypress tests, where we want to be able to mock the social provider
					(runningInCypress &&
						(cypressMockStateCookie === 'google' ||
							cypressMockStateCookie === 'apple'))
				) {
					const path =
						authState.data?.socialProvider ||
						(cypressMockStateCookie as SocialProvider);
					// if there is a social provider in the response (which there should be), then show the social consents page
					// eslint-disable-next-line functional/immutable-data
					authState.confirmationPage = `/welcome/${path}`;
				} else {
					// otherwise fall back to the default consents page
					// eslint-disable-next-line functional/immutable-data
					authState.confirmationPage = consentPages[0].path;
				}

				// also for new social users, we want to make sure they are added to braze
				try {
					await touchBraze({
						ip: req.ip,
						accessToken: tokenSet.access_token,
						request_id: res.locals.requestId,
					});
				} catch (error) {
					logger.error(
						'Error touching braze on oauth callback - new social user',
						{
							error,
						},
						{
							request_id: res.locals.requestId,
							socialProvider: authState.data?.socialProvider,
						},
					);
				}
			}
		}

		// call the IDAPI /auth/oauth-token endpoint
		// to exchange the access token for identity cookies
		// the idapi introspects the access token and if valid
		// will generate and sign cookies for the user the
		// token belonged to
		const cookies = await exchangeAccessTokenForCookies(
			tokenSet.access_token,
			req.ip,
			res.locals.requestId,
		);

		if (cookies) {
			// adds set cookie headers
			setIDAPICookies(res, cookies, authState.doNotSetLastAccessCookie);
		} else {
			logger.error('No cookies returned from IDAPI', undefined, {
				request_id: res.locals.requestId,
			});
		}

		// Apply the registration consents if they exist
		if (authState.data?.encryptedRegistrationConsents) {
			const decryptedConsents = decryptRegistrationConsents(
				authState.data.encryptedRegistrationConsents,
			);

			if (decryptedConsents) {
				if (decryptedConsents.consents?.length) {
					try {
						await updateConsents({
							ip: req.ip,
							accessToken: tokenSet.access_token,
							payload: decryptedConsents.consents,
							request_id: res.locals.requestId,
						});

						// since the CODE newsletters API isn't up to date with PROD newsletters API the
						// review page will not show the correct newsletters on CODE.
						// so when running in cypress we set a cookie to return the decrypted consents to cypress
						// so we can check we at least got to the correct code path
						if (runningInCypress) {
							res.cookie(
								'cypress-consent-response',
								JSON.stringify(decryptedConsents.consents),
							);
						}
					} catch (error) {
						logger.error(
							'Error updating registration consents on oauth callback',
							{
								error,
							},
							{
								request_id: res.locals.requestId,
							},
						);
					}
				}
				if (decryptedConsents.newsletters?.length) {
					try {
						await updateNewsletters({
							ip: req.ip,
							accessToken: tokenSet.access_token,
							payload: decryptedConsents.newsletters,
							request_id: res.locals.requestId,
						});
						// since the CODE newsletters API isn't up to date with PROD newsletters API the
						// review page will not show the correct newsletters on CODE.
						// so when running in cypress we set a cookie to return the decrypted consents to cypress
						// so we can check we at least got to the correct code path
						if (runningInCypress) {
							res.cookie(
								'cypress-newsletter-response',
								JSON.stringify(decryptedConsents.newsletters),
							);
						}
					} catch (error) {
						logger.error(
							'Error updating registration newsletters on oauth callback',
							{
								error,
							},
							{
								request_id: res.locals.requestId,
							},
						);
					}
				} else {
					// we want to create a new user in braze if the user didn't subscribe to any newsletters
					// as otherwise they won't get added to braze until the overnight job runs or they subscribe
					// to a newsletter
					try {
						await touchBraze({
							ip: req.ip,
							accessToken: tokenSet.access_token,
							request_id: res.locals.requestId,
						});
					} catch (error) {
						logger.error(
							'Error touching braze on oauth callback - new user no newsletters',
							{
								error,
							},
							{
								request_id: res.locals.requestId,
							},
						);
					}
				}
			}
		}

		// set the ad-free cookie if the user has the digital-pack product
		await setUserFeatureCookies({
			accessToken: tokenSet.access_token,
			res,
			requestId: res.locals.requestId,
		});

		// clear any existing oauth application cookies if they exist
		checkAndDeleteOAuthTokenCookies(req, res);

		// track the success metric
		trackMetric('OAuthAuthenticationCallback::Success');

		// redirect for jobs to show the jobs t&c page
		// but not if confirmationPage is set (so that we can still show onboarding flow first)
		// before redirecting to the jobs t&c page
		if (
			authState.queryParams.clientId === 'jobs' &&
			!authState.confirmationPage
		) {
			return res.redirect(
				addQueryParamsToPath('/agree/GRS', authState.queryParams),
			);
		}

		// this will only be hit if the user is a new social user coming through an oauth flow initiated by an app
		// in this scenario we want to show the user a consent page, before redirecting them to the end of the oauth flow
		if (
			isSocialRegistration &&
			authState.queryParams.fromURI &&
			(authState.data?.socialProvider ||
				// Cypress Test START
				// this is a special case for the cypress tests, where we want to be able to mock the social provider
				(runningInCypress &&
					(cypressMockStateCookie === 'google' ||
						cypressMockStateCookie === 'apple')))
		) {
			// get the social provider from the authState.data.socialProvider
			// or from the cypress mock state cookie if we're running in cypress
			const path =
				authState.data?.socialProvider ||
				(cypressMockStateCookie as SocialProvider);

			return res.redirect(
				303,
				addQueryParamsToPath(`/welcome/${path}`, authState.queryParams),
			);
		}

		// We only use to this option if the app does not provide a deep link with a custom scheme
		// This allows the native apps to complete the authorization code flow for the app.
		// the fromURI parameter is an undocumented feature from Okta that allows us to
		// rejoin the authorization code flow after we have set a session cookie on our own platform
		if (authState.queryParams.fromURI) {
			return res.redirect(303, authState.queryParams.fromURI);
		}

		// temporary fix: if the user registered on the app (the token will be prefixed),
		// and instead of ending up back in the app but in a mobile browser instead,
		// where we don't want to show the onboarding flow.
		// We simply redirect them to a page telling them to return to app, when app prefix is set.
		// This will be fixed when we either use the passcode registration flow.
		if (
			authState.data?.appPrefix &&
			consentPages.some((page) => page.path === authState.confirmationPage)
		) {
			// eslint-disable-next-line functional/immutable-data
			authState.confirmationPage =
				`/welcome/${authState.data.appPrefix}/complete` as RoutePaths;
		}

		const returnUrl = authState.confirmationPage
			? addQueryParamsToPath(authState.confirmationPage, authState.queryParams)
			: authState.queryParams.returnUrl;

		return res.redirect(303, returnUrl);
	} catch (error) {
		// check if it's an oauth/oidc error
		if (isOAuthError(error)) {
			// log the specific error
			logger.error(
				`${req.method} ${req.originalUrl} OAuth/OIDC Error:`,
				error,
				{
					request_id: res.locals.requestId,
				},
			);
		}

		// log and track the error
		logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
			request_id: res.locals.requestId,
		});
		trackMetric('OAuthAuthenticationCallback::Failure');

		// fallthrough redirect to sign in with generic error
		return redirectForGenericError(req, res);
	}
};

/**
 * @route GET /oauth/authorization-code/application-callback
 *
 * Route to use after Authorization Code flow for getting application OAuth tokens
 * for use within the Gateway app, e.g. for the onboarding flow, etc.
 */
const applicationHandler = (
	req: Request,
	res: ResponseWithRequestState,
	tokenSet: TokenSet,
	authState: AuthorizationState,
) => {
	try {
		// this is just to handle potential errors where we don't get back an access token
		if (!(tokenSet.access_token && tokenSet.id_token)) {
			logger.error(
				'Missing access_token or id_token from /token endpoint in OAuth Callback',
				undefined,
				{
					request_id: res.locals.requestId,
				},
			);
			trackMetric('OAuthApplicationCallback::Failure');
			return redirectForGenericError(req, res);
		}

		// set the access token and id token cookies
		setOAuthTokenCookie(res, 'GU_ACCESS_TOKEN', tokenSet.access_token);
		setOAuthTokenCookie(res, 'GU_ID_TOKEN', tokenSet.id_token);

		// track the success metric
		trackMetric('OAuthApplicationCallback::Success');

		const returnUrl = authState.confirmationPage
			? addQueryParamsToPath(authState.confirmationPage, authState.queryParams)
			: authState.queryParams.returnUrl;

		return res.redirect(303, returnUrl);
	} catch (error) {
		// check if it's an oauth/oidc error
		if (isOAuthError(error)) {
			// log the specific error
			logger.error(
				`${req.method} ${req.originalUrl} OAuth/OIDC Error:`,
				error,
				{
					request_id: res.locals.requestId,
				},
			);
		}

		// log and track the error
		logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
			request_id: res.locals.requestId,
		});
		trackMetric('OAuthApplicationCallback::Failure');

		// fallthrough redirect to sign in with generic error
		return redirectForGenericError(req, res);
	}
};

const deleteHandler = async (
	req: Request,
	res: ResponseWithRequestState,
	tokenSet: TokenSet,
	authState: AuthorizationState,
) => {
	try {
		// this is just to handle potential errors where we don't get back an access token
		if (!tokenSet.access_token) {
			logger.error(
				'Missing access_token from /token endpoint in OAuth Callback',
				undefined,
				{
					request_id: res.locals.requestId,
				},
			);
			trackMetric('OAuthDeleteCallback::Failure');
			return redirectForGenericError(req, res);
		}

		const claims = tokenSet.claims();

		const response = await fetch(deleteAccountStepFunction.url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': deleteAccountStepFunction.apiKey,
				Authorization: `Bearer ${tokenSet.access_token}`,
			},
			body: JSON.stringify({
				identityId: claims.legacy_identity_id,
				reason: authState.data?.deleteReason,
				email: claims.email,
			}),
		});

		if (!response.ok) {
			throw new Error(await response.text());
		}

		trackMetric('OAuthDeleteCallback::Success');

		// the confirmation page is the page we want to go to after sign out
		const confirmationPage = encodeURIComponent(
			`https://${baseUri}${addQueryParamsToPath(
				authState.confirmationPage || '/delete/complete',
				authState.queryParams,
			)}`,
		);

		// sign out link is used to clear any cookies the user has and set the GU_SO cookie post deletion
		const signOutLink = addQueryParamsToPath('/signout', {
			returnUrl: confirmationPage,
		});

		return res.redirect(303, signOutLink);
	} catch (error) {
		// check if it's an oauth/oidc error
		if (isOAuthError(error)) {
			// log the specific error
			logger.error(
				`${req.method} ${req.originalUrl} OAuth/OIDC Error:`,
				error,
				{
					request_id: res.locals.requestId,
				},
			);
		}

		// log and track the error
		logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
			request_id: res.locals.requestId,
		});
		trackMetric('OAuthDeleteCallback::Failure');

		return res.redirect(
			303,
			addQueryParamsToPath('/delete', res.locals.queryParams, {
				error_description: GenericErrors.DEFAULT,
			}),
		);
	}
};

/**
 * Shared route handler for the /oauth/authorization-code/:callbackParam routes
 * Performs the callback for the authorization code flow and does the required
 * checks depending on the callbackParam
 *
 * Will then call the appropriate handler depending on the callbackParam to handle
 * route specific logic
 */
router.get(
	'/oauth/authorization-code/:callbackParam',
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		// determine the redirect uri to use based on the callbackParam
		const redirectUri = (() => {
			switch (req.params.callbackParam) {
				case 'application-callback':
					return ProfileOpenIdClientRedirectUris.APPLICATION;
				case 'callback':
					return ProfileOpenIdClientRedirectUris.AUTHENTICATION;
				case 'delete-callback':
					return ProfileOpenIdClientRedirectUris.DELETE;
				case 'interaction-code-callback':
					return ProfileOpenIdClientRedirectUris.INTERACTION_CODE;
				default:
					return undefined;
			}
		})();

		// if we don't have a redirect uri, then we can't continue, as it's not a valid redirect uri
		if (!redirectUri) {
			return redirectForGenericError(req, res);
		}

		// get the oidc_auth_state cookie which contains the "stateParam" value
		// and "returnUrl" so we can get the user back to the page they
		// initially landed on sign in from
		const authState = getAuthorizationStateCookie(req);

		// check if the state cookie exists, this should be set at the start of the OAuth flow
		// e.g. at sign in
		if (!authState) {
			// If this doesn't exist, that would mean that either
			// a) the state isn't being set correctly, or
			// b) someone is trying to attack the oauth flow
			// for example with an invalid state cookie, or without the state cookie
			// the state cookie is used to prevent CSRF attacks
			logger.error('Missing auth state cookie on OAuth Callback!', undefined, {
				request_id: res.locals.requestId,
			});
			trackMetric('OAuthAuthorization::Failure');
			return redirectForGenericError(req, res);
		}

		// this is only for users coming from social sign in using the
		// interaction code flow/idx api
		// where we need to redirect them to the endpoint that will
		// set a global session cookie, i.e the idx cookie
		// this then redirects the user back to the the same callback uri
		// but with a standard authorization `code` rather than an interaction code
		// and we use the standard authentication flow below to handle this
		if (
			req.params.callbackParam === 'interaction-code-callback' &&
			req.query.interaction_code &&
			req.query.state === authState.stateParam
		) {
			return res.redirect(
				303,
				`/login/token/redirect?stateToken=${authState.data?.stateToken}`,
			);
		}

		// Determine which OpenIdClient to use, in DEV we use the DevProfileIdClient, otherwise we use the ProfileOpenIdClient
		const OpenIdClient = getOpenIdClient(req);

		// params returned from the /authorize endpoint
		// for auth code flow they will be "code" and "state"
		// "code" is the authorization code to exchange for access token
		// "state" will be the "stateParam" value set in the oidc_auth_state cookie
		// if there were any errors, then an "error", and "error_description" params
		// will be returned instead
		const callbackParams = OpenIdClient.callbackParams(req);

		// we have the Authorization State now, so the cookie is
		// no longer required, so mark cookie for deletion in the response
		deleteAuthorizationStateCookie(res);

		// check for specific oauth errors and handle them as required
		if (isOAuthError(callbackParams)) {
			// check if the callback params contain an login_required error
			// used to check if a session existed before the user is shown a sign in page
			if (callbackParams.error === OpenIdErrors.LOGIN_REQUIRED) {
				trackMetric('OAuthAuthorization::Failure');
				return res.redirect(
					addQueryParamsToPath('/signin', authState.queryParams, {
						error: callbackParams.error,
						error_description: callbackParams.error_description,
					}),
				);
			}

			// check for social account linking errors
			// and redirect to the sign in page with the social sign in blocked error
			if (
				callbackParams.error === OpenIdErrors.ACCESS_DENIED &&
				callbackParams.error_description ===
					OpenIdErrorDescriptions.ACCOUNT_LINKING_DENIED_GROUPS
			) {
				trackMetric('OAuthAuthorization::Failure');
				return res.redirect(
					addQueryParamsToPath('/signin', authState.queryParams, {
						error: FederationErrors.SOCIAL_SIGNIN_BLOCKED,
					}),
				);
			}
		}

		// exchange the auth code for access token + id token
		// and check the "state" we got back from the callback
		// to the "stateParam" that was set in the AuthorizationState
		// to prevent CSRF attacks
		// eslint-disable-next-line functional/no-let -- We need to be able to reassign tokenSet if we have to refresh the token
		let tokenSet: TokenSet | null = await OpenIdClient.callback(
			// the redirectUri is the callback location (this route)
			redirectUri,
			// the params sent to the callback
			callbackParams,
			// checks to make sure that everything is valid
			{
				// we're doing the auth code flow, so check for the correct type
				response_type: 'code',
				// check that the stateParam is the same
				state: authState.stateParam,
				// code verifier is required for PKCE if we're using it
				code_verifier: authState.data?.codeVerifier,
			},
		);

		// We need the access token to include the legacy_identity_id claim.
		// Especially in the case of social registration, IDAPI can take longer
		// to create an IDAPI user and update with the new ID than it takes
		// for Okta to return the browser to this callback endpoint. For this
		// reason, we need to wait until the IDAPI operation completes and the
		// Okta user is updated before we can proceed.
		// 1. Check if the original access token is missing the legacy_identity_id claim.
		// 2. If it is, use the refresh token we got from the callback to get
		//    a new access token, and check that.
		// 3. Once the claim is present, proceed with the rest of the callback logic.
		// 4. If the claim is not present after a timeout, return an error to the user.
		const refreshToken = tokenSet.refresh_token;
		const { legacy_identity_id } = tokenSet.claims();
		if (!refreshToken && !legacy_identity_id) {
			// We can't do this step without the refresh token, so if it's missing, just continue
			// to the callback function - we may encounter errors there.
			trackMetric('OAuthAuthorization::ProvisioningFailure');
			logger.error(
				'Access token missing legacy_identity_id and no refresh token available',
				undefined,
				{
					request_id: res.locals.requestId,
				},
			);
		} else if (refreshToken && !legacy_identity_id) {
			tokenSet = await waitForLegacyIdentityId(
				OpenIdClient,
				tokenSet,
				refreshToken,
			);
			if (!tokenSet) {
				trackMetric('OAuthAuthorization::ProvisioningFailure');
				logger.error(
					'Gave up waiting for Okta to return access token with legacy_identity_id',
					undefined,
					{
						request_id: res.locals.requestId,
					},
				);
				return res.redirect(
					addQueryParamsToPath('/reauthenticate', authState.queryParams, {
						error: RegistrationErrors.PROVISIONING_FAILURE,
					}),
				);
			}
			// After waiting, the tokenSet contains an access token with the legacy_identity_id claim.
			trackMetric('OAuthAuthorization::Success');
		} else {
			// We already have the legacy_identity_id claim so we can proceed.
			trackMetric('OAuthAuthorization::Success');
		}

		// call the appropriate handler depending on the callbackParam
		switch (req.params.callbackParam) {
			case 'application-callback':
				return applicationHandler(req, res, tokenSet, authState);
			case 'callback':
			// this is only used when we get back a standard auth `code` from the interaction code flow
			// where we want to do the standard authentication callback
			case 'interaction-code-callback':
				return authenticationHandler(req, res, tokenSet, authState);
			case 'delete-callback':
				return deleteHandler(req, res, tokenSet, authState);
			default:
				trackMetric('OAuthAuthorization::Failure');
				return redirectForGenericError(req, res);
		}
	}),
);

export default router.router;
