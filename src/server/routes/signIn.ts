import { Request } from 'express';
import { authenticate as authenticateWithIdapi } from '@/server/lib/idapi/auth';
import { authenticate as authenticateWithOkta } from '@/server/lib/okta/api/authentication';
import { logger } from '@/server/lib/serverSideLogger';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/trackMetric';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { setIDAPICookies } from '@/server/lib/idapi/IDAPICookies';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { decrypt } from '@/server/lib/idapi/decryptToken';
import {
	FederationErrors,
	GenericErrors,
	RegistrationErrors,
	SignInErrors,
} from '@/shared/model/Errors';
import { ApiError } from '@/server/models/Error';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { readEmailCookie } from '@/server/lib/emailCookie';
import handleRecaptcha from '@/server/lib/recaptcha';
import { OAuthError, OktaError } from '@/server/models/okta/Error';
import {
	performAuthorizationCodeFlow,
	scopesForAuthentication,
} from '@/server/lib/okta/oauth';
import { getCurrentSession } from '@/server/lib/okta/api/sessions';
import { redirectIfLoggedIn } from '@/server/lib/middleware/redirectIfLoggedIn';
import { getUser, getUserGroups } from '@/server/lib/okta/api/users';
import { clearOktaCookies } from '@/server/routes/signOut';
import {
	getMatchingSignInGateIdFromComponentEventParamsQuery,
	sendOphanComponentEventFromQueryParamsServer,
} from '@/server/lib/ophan';
import { isBreachedPassword } from '@/server/lib/breachedPasswordCheck';
import { mergeRequestState } from '@/server/lib/requestState';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import {
	readEncryptedStateCookie,
	setEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { sendEmailToUnvalidatedUser } from '@/server/lib/unvalidatedEmail';
import {
	ProfileOpenIdClientRedirectUris,
	setAuthorizationStateCookie,
	updateAuthorizationStateData,
} from '@/server/lib/okta/openid-connect';
import { SocialProvider, isValidSocialProvider } from '@/shared/model/Social';
import { interact } from '@/server/lib/okta/idx/interact';
import {
	introspect,
	redirectIdpSchema,
} from '@/server/lib/okta/idx/introspect';

const { okta, accountManagementUrl, oauthBaseUrl, defaultReturnUri } =
	getConfiguration();

/**
 * Helper method to determine if a global error should show on the sign in page
 * and return a user facing error if so
 * if there's no error it returns undefined
 * @param error - error query parameter
 * @param error_description - error_description query parameter
 * @returns string | undefined - user facing error message
 */
export const getErrorMessageFromQueryParams = (
	error?: string,
	error_description?: string,
) => {
	// show error if account linking required
	if (error === FederationErrors.SOCIAL_SIGNIN_BLOCKED) {
		return SignInErrors.ACCOUNT_ALREADY_EXISTS;
	}
	// Show error if provisioning failed
	if (error === RegistrationErrors.PROVISIONING_FAILURE) {
		return error;
	}
	// TODO: we're propagating a generic error message for now until we know what we're doing with the error_description parameter
	if (error_description) {
		return SignInErrors.GENERIC;
	}
};

/**
 * Controller to render the sign in page in both IDAPI and Okta
 */
router.get(
	'/signin',
	redirectIfLoggedIn,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		const { encryptedEmail, error, error_description } = state.queryParams;

		// first attempt to get email from IDAPI encryptedEmail if it exists
		const decryptedEmail =
			encryptedEmail &&
			(await decrypt(encryptedEmail, req.ip, res.locals.requestId));

		// followed by the gateway EncryptedState
		// if it exists
		const email = decryptedEmail || readEmailCookie(req);

		const html = renderer('/signin', {
			requestState: mergeRequestState(state, {
				pageData: {
					email,
				},
				globalMessage: {
					error: getErrorMessageFromQueryParams(error, error_description),
				},
			}),
			pageTitle: 'Sign in',
		});
		return res.type('html').send(html);
	}),
);

router.get(
	'/signin/email-sent',
	(req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		const html = renderer('/signin/email-sent', {
			requestState: mergeRequestState(state, {
				pageData: {
					email: readEncryptedStateCookie(req)?.email,
				},
			}),
			pageTitle: 'Check Your Inbox',
		});
		res.type('html').send(html);
	},
);

router.post(
	'/signin/email-sent/resend',
	handleRecaptcha,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const {
			queryParams: { appClientId },
			requestId: request_id,
		} = res.locals;

		// We don't need to check the useIdapi flag as a user can only
		// get into this flow after an attempt to login with Okta
		try {
			const encryptedState = readEncryptedStateCookie(req);
			const { email } = encryptedState ?? {};

			if (typeof email == 'undefined') {
				throw new OktaError({
					message:
						'Could not resend unvalidated user email as email was undefined',
				});
			}

			const user = await getUser(email);
			const { id } = user;
			const groups = await getUserGroups(id);
			// check if the user has their email validated based on group membership
			const emailValidated = groups.some(
				(group) => group.profile.name === 'GuardianUser-EmailValidated',
			);
			if (emailValidated) {
				throw new OktaError({
					message:
						'Could not resend unvalidated user email as user is already validated.',
				});
			}

			await sendEmailToUnvalidatedUser({
				id,
				email: user.profile.email,
				appClientId,
				request_id,
			});
			setEncryptedStateCookie(res, {
				email: user.profile.email,
			});

			return res.redirect(
				303,
				addQueryParamsToPath('/signin/email-sent', res.locals.queryParams, {
					emailSentSuccess: true,
				}),
			);
		} catch (error) {
			logger.error('Okta unvalidated user resend email failure', error, {
				request_id: res.locals.requestId,
			});
			return res.type('html').send(
				renderer('/signin/email-sent', {
					pageTitle: 'Check Your Inbox',
					requestState: mergeRequestState(res.locals, {
						pageData: {
							formError: GenericErrors.DEFAULT,
						},
					}),
				}),
			);
		}
	}),
);

// We don't do any session checking on /reauthenticate - if someone's ended up
// here, it's probably because their session is invalid or expired and they need
// to be allowed to attempt to sign in again.
router.get(
	'/reauthenticate',
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		const { encryptedEmail, error, error_description } = state.queryParams;

		// first attempt to get email from IDAPI encryptedEmail if it exists
		const decryptedEmail =
			encryptedEmail &&
			(await decrypt(encryptedEmail, req.ip, res.locals.requestId));

		// followed by the gateway EncryptedState
		// if it exists
		const email = decryptedEmail || readEmailCookie(req);

		const html = renderer('/reauthenticate', {
			requestState: mergeRequestState(state, {
				pageData: {
					email,
				},
				globalMessage: {
					error: getErrorMessageFromQueryParams(error, error_description),
				},
			}),
			pageTitle: 'Sign in',
		});
		res.type('html').send(html);
	}),
);

router.post(
	'/reauthenticate',
	handleRecaptcha,
	handleAsyncErrors((req: Request, res: ResponseWithRequestState) => {
		const { useIdapi } = res.locals.queryParams;
		const {
			queryParams: { appClientId },
			requestId: request_id,
		} = res.locals;
		if (okta.enabled && !useIdapi) {
			// if okta feature switch enabled, use okta authentication
			return oktaSignInController({
				req,
				res,
				isReauthenticate: true,
				appClientId,
				request_id,
			});
		} else {
			// if okta feature switch disabled, use identity authentication
			return idapiSignInController(req, res);
		}
	}),
);

router.post(
	'/signin',
	handleRecaptcha,
	handleAsyncErrors((req: Request, res: ResponseWithRequestState) => {
		const { useIdapi } = res.locals.queryParams;
		const {
			queryParams: { appClientId },
			requestId: request_id,
		} = res.locals;
		if (okta.enabled && !useIdapi) {
			// if okta feature switch enabled, use okta authentication
			return oktaSignInController({
				req,
				res,
				isReauthenticate: false,
				appClientId,
				request_id,
			});
		} else {
			// if okta feature switch disabled, use identity authentication
			return idapiSignInController(req, res);
		}
	}),
);

const idapiSignInController = async (
	req: Request,
	res: ResponseWithRequestState,
) => {
	const { email = '', password = '' } = req.body;
	const { queryParams } = res.locals;
	const { returnUrl } = queryParams;

	try {
		const cookies = await authenticateWithIdapi(
			email,
			password,
			req.ip,
			res.locals.queryParams,
			res.locals.requestId,
		);

		// because we are signing in using idapi, and a new okta
		// session will not be created, so we will need to clear the okta
		// cookies to keep the sessions in sync
		clearOktaCookies(res);
		setIDAPICookies(res, cookies);

		trackMetric('SignIn::Success');

		return res.redirect(303, returnUrl);
	} catch (error) {
		logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
			request_id: res.locals.requestId,
		});
		const { message, status } =
			error instanceof ApiError ? error : new ApiError();

		trackMetric('SignIn::Failure');

		// re-render the sign in page on error, with pre-filled email
		const html = renderer('/signin', {
			requestState: mergeRequestState(res.locals, {
				pageData: {
					email,
					formError: message,
				},
			}),
			pageTitle: 'Sign in',
		});

		return res.status(status).type('html').send(html);
	}
};

// handles errors in the catch block to return a error to display to the user
const oktaSignInControllerErrorHandler = (error: unknown) => {
	if (
		error instanceof OktaError &&
		error.name === 'AuthenticationFailedError'
	) {
		return {
			status: error.status,
			message: SignInErrors.AUTHENTICATION_FAILED,
		};
	}

	return new OktaError({ message: SignInErrors.GENERIC });
};

const oktaSignInController = async ({
	req,
	res,
	isReauthenticate = false,
	appClientId,
	request_id,
}: {
	req: Request;
	res: ResponseWithRequestState;
	isReauthenticate?: boolean;
	appClientId?: string;
	request_id?: string;
}) => {
	// get the email and password from the request body
	const { email = '', password = '' } = req.body;

	// Okta Identity Engine session cookie is called `idx`
	const oktaIdentityEngineSessionCookieId: string | undefined = req.cookies.idx;

	if (!isReauthenticate) {
		try {
			if (oktaIdentityEngineSessionCookieId) {
				// if a session already exists then we redirect back to the returnUrl for apps, and the dotcom homepage for web
				await getCurrentSession({
					idx: oktaIdentityEngineSessionCookieId,
				});
				return res.redirect(accountManagementUrl);
			}
		} catch {
			// We log this scenario as it is quite unlikely, but we continue to sign the user in.
			logger.info(
				'User POSTed to /signin with an invalid `idx` session cookie',
				undefined,
				{ request_id: res.locals.requestId },
			);
		}
	}

	try {
		// attempt to authenticate with okta
		// if authentication fails, it will fall through to the catch
		// the response contains a one time use sessionToken that we can exchange
		// for a session cookie
		const response = await authenticateWithOkta({
			username: email,
			password,
		});

		// we only support the SUCCESS status for Okta authentication in gateway
		// Other statuses could be supported in the future https://developer.okta.com/docs/reference/api/authn/#transaction-state
		if (response.status !== 'SUCCESS') {
			throw new ApiError({
				message:
					'User authenticating was blocked due to unsupported Okta Authentication status property',
				status: 403,
			});
		}

		// fire ophan component event if applicable when a session is set
		if (res.locals.queryParams.componentEventParams) {
			void sendOphanComponentEventFromQueryParamsServer(
				res.locals.queryParams.componentEventParams,
				'SIGN_IN',
				'web',
				res.locals.ophanConfig.consentUUID,
				res.locals.requestId,
			);
		}

		// we're authenticated track this metric
		trackMetric('OktaSignIn::Success');

		if (response._embedded?.user.id) {
			// retrieve the user groups
			const groups = await getUserGroups(response._embedded.user.id);

			// check if the user has their email validated based on group membership
			const emailValidated = groups.some(
				(group) => group.profile.name === 'GuardianUser-EmailValidated',
			);

			// check the user password strength
			const hasWeakPassword = await isBreachedPassword(password);

			// For MVP2 we want to log if the user is in one of the 4 following states
			// 1. User is in the GuardianUser-EmailValidated group and has a strong password
			// 2. User is in the GuardianUser-EmailValidated group and has a weak password
			// 3. User is not in the GuardianUser-EmailValidated group and has a strong password
			// 4. User is not in the GuardianUser-EmailValidated group and has a weak password
			if (emailValidated && !hasWeakPassword) {
				trackMetric('User-EmailValidated-StrongPassword');
			} else if (emailValidated && hasWeakPassword) {
				trackMetric('User-EmailValidated-WeakPassword');
			} else if (!emailValidated && !hasWeakPassword) {
				trackMetric('User-EmailNotValidated-StrongPassword');
			} else if (!emailValidated && hasWeakPassword) {
				trackMetric('User-EmailNotValidated-WeakPassword');
			}

			if (!emailValidated) {
				await sendEmailToUnvalidatedUser({
					id: response._embedded.user.id,
					email: response._embedded.user.profile.login,
					appClientId,
					request_id,
				});
				setEncryptedStateCookie(res, {
					email: response._embedded.user.profile.login,
				});

				return res.redirect(
					303,
					addQueryParamsToPath('/signin/email-sent', res.locals.queryParams, {
						emailSentSuccess: true,
					}),
				);
			}
		}

		// we now need to generate an okta session
		// so we'll call the OIDC /authorize endpoint which sets a session cookie
		// we'll pretty much be performing the Authorization Code Flow
		return await performAuthorizationCodeFlow(req, res, {
			sessionToken: response.sessionToken,
			closeExistingSession: true,
			prompt: 'none',
			scopes: scopesForAuthentication,
			redirectUri: ProfileOpenIdClientRedirectUris.AUTHENTICATION,
		});
	} catch (error) {
		trackMetric('OktaSignIn::Failure');

		logger.error('Okta authentication error:', error, {
			request_id: res.locals.requestId,
		});

		const { message, status } = oktaSignInControllerErrorHandler(error);

		const html = renderer('/signin', {
			requestState: mergeRequestState(res.locals, {
				pageData: {
					email,
					formError: message,
				},
			}),
			pageTitle: 'Sign in',
		});

		return res.status(status).type('html').send(html);
	}
};

/**
 * If an Okta session exists, this route will re-authenticate the Okta session
 * and also refresh the IDAPI session concurrently, synchronising the expiry
 * times of the Okta and IDAPI sessions, before returning the client to the URL
 * they came from.
 */
router.get(
	'/signin/refresh',
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const { returnUrl } = res.locals.queryParams;
		// Okta Identity Engine session cookie is called `idx`
		const oktaIdentityEngineSessionCookieId: string | undefined =
			req.cookies.idx;
		const identitySessionCookie = req.cookies.SC_GU_U;

		const redirectUrl = returnUrl || defaultReturnUri;

		// Check if the user has an existing Okta session.
		if (okta.enabled && oktaIdentityEngineSessionCookieId) {
			try {
				// If the user session is valid, we re-authenticate them, supplying
				// the idx cookie value to Okta.
				await getCurrentSession({
					idx: oktaIdentityEngineSessionCookieId,
				});
				return performAuthorizationCodeFlow(req, res, {
					doNotSetLastAccessCookie: true,
					prompt: 'none',
					scopes: scopesForAuthentication,
					redirectUri: ProfileOpenIdClientRedirectUris.AUTHENTICATION,
				});
			} catch {
				//if the cookie exists, but the session is invalid, we remove the cookie
				//and return them to the URL they came from
				clearOktaCookies(res);
				return res.redirect(redirectUrl);
			}
		} else if (identitySessionCookie) {
			// If there isn't an Okta session, there's nothing to synchronise the
			// IDAPI session with, so we bail here and return to the URL they came from
			return res.redirect(redirectUrl);
		} else {
			// If there are no Okta or IDAPI cookies, why are you here? We bail and
			// send the client to the /signin page.
			return res.redirect('/signin');
		}
	}),
);

router.get(
	'/signin/:social',
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const { returnUrl } = res.locals.queryParams;
		const socialIdp = req.params.social as SocialProvider;

		if (!isValidSocialProvider(socialIdp)) {
			return res.redirect(303, '/signin');
		}

		if (okta.enabled) {
			// get the IDP id from the config
			const idp = okta.social[socialIdp];

			// fire ophan component event if applicable when a session is set
			if (res.locals.queryParams.componentEventParams) {
				void sendOphanComponentEventFromQueryParamsServer(
					res.locals.queryParams.componentEventParams,
					'SIGN_IN',
					req.params.social,
					res.locals.ophanConfig.consentUUID,
					res.locals.requestId,
				);
			}

			/* AB TEST LOGIC START */
			// The componentEventParams query parameter stores Ophan tracking data, but we want to
			// parse it to check if this registration is coming via specific sign-in gates we're AB testing,
			// so we can send an offer email after registration is complete.
			const signInGateId =
				await getMatchingSignInGateIdFromComponentEventParamsQuery({
					componentEventParamsQuery:
						res.locals.queryParams.componentEventParams,
					request_id: res.locals.requestId,
				});
			/* AB TEST LOGIC END */

			// OKTA IDX API FLOW
			// attempt to authenticate social using the idx api/interaction code flow
			// if this fails with any error, we fall back to okta hosted flow
			try {
				const [{ interaction_handle }, authState] = await interact(req, res, {
					closeExistingSession: true,
				});

				const introspectResponse = await introspect({
					interactionHandle: interaction_handle,
				});

				const updatedAuthState = updateAuthorizationStateData(authState, {
					socialProvider: socialIdp,
					stateToken: introspectResponse.stateHandle.split('~')[0],
				});

				setAuthorizationStateCookie(updatedAuthState, res);

				const introspectIdp = introspectResponse.remediation.value.find(
					({ name, type }) =>
						name === 'redirect-idp' && type === socialIdp.toUpperCase(),
				);

				if (
					introspectIdp &&
					redirectIdpSchema.safeParse(introspectIdp).success
				) {
					const redirectIdp = redirectIdpSchema.parse(introspectIdp);

					trackMetric('OktaIDXSocialSignIn::Redirect');

					return res.redirect(303, redirectIdp.href);
				} else {
					throw new OAuthError(
						{
							error: 'invalid_response',
							error_description: 'Invalid or missing redirect-idp remediation',
						},
						404,
					);
				}
			} catch (error) {
				trackMetric('OktaIDXSocialSignIn::Failure');
				logger.error('IDX API - Social sign in error:', error, {
					request_id: res.locals.requestId,
				});
			}

			// OKTA LEGACY SOCIAL FLOW
			// if okta feature switch enabled, perform authorization code flow with idp
			return await performAuthorizationCodeFlow(req, res, {
				idp,
				closeExistingSession: true,
				scopes: scopesForAuthentication,
				redirectUri: ProfileOpenIdClientRedirectUris.AUTHENTICATION,
				extraData: {
					socialProvider: socialIdp,
					signInGateId,
				},
			});
		} else {
			// if okta feature switch disabled, redirect to identity-federation-api
			const socialUrl = new URL(`${oauthBaseUrl}/${socialIdp}/signin`);
			socialUrl.searchParams.append('returnUrl', returnUrl);

			return res.redirect(303, socialUrl.toString());
		}
	}),
);

export default router.router;
