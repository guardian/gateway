import { Request } from 'express';
import { authenticate as authenticateWithOkta } from '@/server/lib/okta/api/authentication';
import { logger } from '@/server/lib/serverSideLogger';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/trackMetric';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { decrypt } from '@/server/lib/idapi/decryptToken';
import {
	FederationErrors,
	GatewayError,
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
import { sendOphanComponentEventFromQueryParamsServer } from '@/server/lib/ophan';
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
import { startIdxFlow } from '@/server/lib/okta/idx/startIdxFlow';
import { isOktaError } from '@/server/lib/okta/api/errors';
import {
	identify,
	validateIdentifyRemediation,
} from '@/server/lib/okta/idx/identify';
import { findAuthenticatorId } from '@/server/lib/okta/idx/shared/findAuthenticatorId';
import {
	challenge,
	isChallengeAnswerCompleteLoginResponse,
	validateChallengeAnswerRemediation,
	validateChallengeRemediation,
} from '@/server/lib/okta/idx/challenge';
import { submitPassword } from '@/server/lib/okta/idx/shared/submitPasscode';
import { getLoginRedirectUrl } from '@/server/lib/okta/idx/shared/idxFetch';
import { credentialEnroll } from '@/server/lib/okta/idx/credential';
import { changePasswordEmailIdx } from '@/server/controllers/sendChangePasswordEmail';

const { okta, accountManagementUrl, defaultReturnUri, passcodesEnabled } =
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
		return SignInErrors.SOCIAL_SIGNIN_ERROR;
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
			encryptedEmail && (await decrypt(encryptedEmail, req.ip));

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
		} = res.locals;

		try {
			const encryptedState = readEncryptedStateCookie(req);
			const { email } = encryptedState ?? {};

			if (typeof email == 'undefined') {
				throw new OktaError({
					message:
						'Could not resend unvalidated user email as email was undefined',
				});
			}

			const user = await getUser(email, req.ip);
			const { id } = user;
			const groups = await getUserGroups(id, req.ip);
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
				ip: req.ip,
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
			logger.error('Okta unvalidated user resend email failure', error);
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
			encryptedEmail && (await decrypt(encryptedEmail, req.ip));

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
		const {
			queryParams: { appClientId },
		} = res.locals;
		// if okta feature switch enabled, use okta authentication
		return oktaSignInController({
			req,
			res,
			isReauthenticate: true,
			appClientId,
		});
	}),
);

router.post(
	'/signin',
	handleRecaptcha,
	handleAsyncErrors((req: Request, res: ResponseWithRequestState) => {
		const {
			queryParams: { appClientId },
		} = res.locals;
		// if okta feature switch enabled, use okta authentication
		return oktaSignInController({
			req,
			res,
			isReauthenticate: false,
			appClientId,
		});
	}),
);

interface SignInError {
	status: number;
	gatewayError: GatewayError;
}

// handles errors in the catch block to return a error to display to the user
const oktaSignInControllerErrorHandler = (error: unknown): SignInError => {
	if (
		(error instanceof OktaError &&
			error.name === 'AuthenticationFailedError') ||
		(error instanceof OAuthError && error.code.includes('E0000004'))
	) {
		return {
			status: 401, // always return 401 for authentication failed
			gatewayError: {
				message: SignInErrors.AUTHENTICATION_FAILED,
				severity: 'BAU',
			},
		};
	}

	return {
		status: 500,
		gatewayError: {
			severity: 'UNEXPECTED',
			message: SignInErrors.GENERIC,
		},
	};
};

/**
 * @name oktaIdxApiSignInController
 * @description Start the Okta IDX flow to attempt to sign the user in with a password
 *
 * @param {Request} req - Express request object
 * @param {ResponseWithRequestState} res - Express response object
 * @returns {Promise<void>}
 */
const oktaIdxApiSignInController = async ({
	req,
	res,
}: {
	req: Request;
	res: ResponseWithRequestState;
}) => {
	// TODO: remove when the useIdxSignIn feature flag is removed
	// placeholder warning message
	logger.warn(
		'IDX API password authentication flow is not fully implemented yet',
	);

	// get the email and password from the request body
	const { email = '', password = '' } = req.body;

	try {
		// First we want to check the user status in Okta
		// to see if they are in the ACTIVE state
		// if they are not, we will not allow them to sign in
		const user = await getUser(email, req.ip).catch((error) => {
			// handle any getUser errors here instead of the outer catch block
			if (isOktaError(error)) {
				// convert the user not found error to generic authentication error to outer catch block
				if (error.status === 404 && error.code === 'E0000007') {
					throw new OktaError({
						code: 'E0000004',
						message: 'User not found',
					});
				}

				// otherwise throw the error to outer catch block
				throw new OktaError({
					code: error.code,
					message: error.message,
				});
			}

			// and any other error to outer catch block
			throw error;
		});

		if (user.status !== 'ACTIVE') {
			// throw authentication error if user is not in the ACTIVE state
			throw new OktaError({
				code: 'E0000004',
				message: 'User is not in the ACTIVE state',
			});
		}

		// at this point the user will be in the ACTIVE state
		// start the IDX flow by calling interact and introspect
		const introspectResponse = await startIdxFlow({
			req,
			res,
			authorizationCodeFlowOptions: {},
		});

		// call "identify", essentially to start an authentication process
		const identifyResponse = await identify(
			introspectResponse.stateHandle,
			email,
			req.ip,
		);

		validateIdentifyRemediation(
			identifyResponse,
			'select-authenticator-authenticate',
		);

		// check for the "password" authenticator, we can only authenticate with a password
		// if this authenticator is present
		const passwordAuthenticatorId = findAuthenticatorId({
			authenticator: 'password',
			response: identifyResponse,
			remediationName: 'select-authenticator-authenticate',
		});

		// if the password authenticator is not found, we cannot authenticate with a password
		// this would be a case where the user is a passwordless or SOCIAL user
		if (!passwordAuthenticatorId) {
			throw new OktaError({
				code: 'E0000004',
				message: 'Password authenticator not found',
			});
		}

		// call "challenge" to start the password authentication process
		const challengePasswordResponse = await challenge(
			introspectResponse.stateHandle,
			{
				id: passwordAuthenticatorId,
				methodType: 'password',
			},
			req.ip,
		);

		// validate that the response from the challenge endpoint is a password authenticator
		// and has the "recover" remediation
		validateChallengeRemediation(
			challengePasswordResponse,
			'challenge-authenticator',
			'password',
		);

		// call "challenge/answer" to answer the password challenge
		const challengeAnswerResponse = await submitPassword({
			password,
			stateHandle: challengePasswordResponse.stateHandle,
			introspectRemediation: 'challenge-authenticator',
			ip: req.ip,
		});

		// if the user has made it here, they've successfully authenticated
		trackMetric('OktaIdxSignIn::Success');

		// check the response from the challenge/answer endpoint
		// if not a "CompleteLoginResponse" then Okta is in the state
		// where the user needs to enroll in the "email" authenticator
		if (!isChallengeAnswerCompleteLoginResponse(challengeAnswerResponse)) {
			// but first we have to check that the response remediation is the "select-authenticator-enroll"
			validateChallengeAnswerRemediation(
				challengeAnswerResponse,
				'select-authenticator-enroll',
			);

			// check for the email authenticator id in the response to make sure that it's the correct enrollment flow
			const challengeAnswerEmailAuthenticatorId = findAuthenticatorId({
				authenticator: 'email',
				response: challengeAnswerResponse,
				remediationName: 'select-authenticator-enroll',
			});

			// if the email authenticator id is not found, then throw an error to fall back to the classic reset password flow
			if (!challengeAnswerEmailAuthenticatorId) {
				throw new OktaError({
					message: `Okta changePasswordEmailIdx failed as email authenticator id is not found in the response`,
				});
			}

			// call the "challenge" endpoint to start the email challenge process
			// and send the user a passcode
			const challengeEmailResponse = await credentialEnroll(
				challengeAnswerResponse.stateHandle,
				{
					id: challengeAnswerEmailAuthenticatorId,
					methodType: 'email',
				},
				req.ip,
			);

			// set the encrypted state cookie to persist the email and stateHandle
			// which we need to persist during the passcode reset flow
			setEncryptedStateCookie(res, {
				email,
				stateHandle: challengeEmailResponse.stateHandle,
				stateHandleExpiresAt: challengeEmailResponse.expiresAt,
				userState: 'ACTIVE_PASSWORD_ONLY',
			});

			// show the email sent page, with passcode instructions
			return res.redirect(
				303,
				addQueryParamsToPath('/signin/email-sent', res.locals.queryParams),
			);
		}

		// retrieve the user groups
		const groups = await getUserGroups(
			challengeAnswerResponse.user.value.id,
			req.ip,
		);

		// check if the user has their email validated based on group membership
		const emailValidated = groups.some(
			(group) => group.profile.name === 'GuardianUser-EmailValidated',
		);

		// check the user password strength
		const hasWeakPassword = await isBreachedPassword(password);

		// We want to log if the user is in one of the 4 following states
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

		// if the user doesn't have their email validated, we need to verify their email
		if (!emailValidated) {
			// use the idx reset password flow to send the user a passcode
			await changePasswordEmailIdx({
				req,
				res,
				user,
				emailSentPage: '/signin/email-sent',
			});
			// if successful, the user will be redirected to the email sent page
			// so we need to check if the headers have been sent to prevent further processing
			if (res.headersSent) {
				return;
			} else {
				// if the headers have not been sent there has been an unexpected error
				// so throw an error
				throw new OktaError({
					message: 'Okta changePasswordEmailIdx in signin failed',
				});
			}
		}

		// otherwise continue allowing the user to log in
		const loginRedirectUrl = getLoginRedirectUrl(challengeAnswerResponse);

		// fire ophan component event if applicable
		if (res.locals.queryParams.componentEventParams) {
			void sendOphanComponentEventFromQueryParamsServer(
				res.locals.queryParams.componentEventParams,
				'SIGN_IN',
				'web',
				res.locals.ophanConfig.consentUUID,
			);
		}

		// redirect the user to set a global session and then back to completing the authorization flow
		return res.redirect(303, loginRedirectUrl);
	} catch (error) {
		logger.error('Okta oktaIdxApiSignInController failed', error);

		trackMetric('OktaIdxSignIn::Failure');

		const { status, gatewayError } = oktaSignInControllerErrorHandler(error);

		const html = renderer('/signin', {
			requestState: mergeRequestState(res.locals, {
				pageData: {
					email,
					formError: gatewayError,
				},
			}),
			pageTitle: 'Sign in',
		});

		return res.status(status).type('html').send(html);
	}
};

const oktaSignInController = async ({
	req,
	res,
	isReauthenticate = false,
	appClientId,
}: {
	req: Request;
	res: ResponseWithRequestState;
	isReauthenticate?: boolean;
	appClientId?: string;
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
					ip: req.ip,
				});
				return res.redirect(accountManagementUrl);
			}
		} catch {
			// We log this scenario as it is quite unlikely, but we continue to sign the user in.
			logger.info(
				'User POSTed to /signin with an invalid `idx` session cookie',
				undefined,
			);
		}
	}

	try {
		// idx api flow
		if (passcodesEnabled && res.locals.queryParams.useIdxSignIn) {
			// try to start the IDX flow to sign in the user with a password
			await oktaIdxApiSignInController({
				req,
				res,
			});
			// if successful, the user will be redirected
			// so we need to check if the headers have been sent to prevent further processing
			if (res.headersSent) {
				return;
			}
		}

		// attempt to authenticate with okta
		// if authentication fails, it will fall through to the catch
		// the response contains a one time use sessionToken that we can exchange
		// for a session cookie
		const response = await authenticateWithOkta(
			{
				username: email,
				password,
			},
			req.ip,
		);

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
			);
		}

		// we're authenticated track this metric
		trackMetric('OktaSignIn::Success');

		if (response._embedded?.user.id) {
			// retrieve the user groups
			const groups = await getUserGroups(response._embedded.user.id, req.ip);

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
					ip: req.ip,
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

		logger.error('Okta authentication error:', error);

		const { status, gatewayError } = oktaSignInControllerErrorHandler(error);

		const html = renderer('/signin', {
			requestState: mergeRequestState(res.locals, {
				pageData: {
					email,
					formError: gatewayError,
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

		const redirectUrl = returnUrl || defaultReturnUri;

		// Check if the user has an existing Okta session.
		if (oktaIdentityEngineSessionCookieId) {
			try {
				// If the user session is valid, we re-authenticate them, supplying
				// the idx cookie value to Okta.
				await getCurrentSession({
					idx: oktaIdentityEngineSessionCookieId,
					ip: req.ip,
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
		} else {
			// If there are no Okta cookies, why are you here? We bail and
			// send the client to the /signin page.
			return res.redirect('/signin');
		}
	}),
);

router.get(
	'/signin/:social',
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const socialIdp = req.params.social as SocialProvider;

		if (!isValidSocialProvider(socialIdp)) {
			return res.redirect(303, '/signin');
		}

		// get the IDP id from the config
		const idp = okta.social[socialIdp];

		// fire ophan component event if applicable when a session is set
		if (res.locals.queryParams.componentEventParams) {
			void sendOphanComponentEventFromQueryParamsServer(
				res.locals.queryParams.componentEventParams,
				'SIGN_IN',
				req.params.social,
				res.locals.ophanConfig.consentUUID,
			);
		}

		// OKTA IDX API FLOW
		// attempt to authenticate social using the idx api/interaction code flow
		// if this fails with any error, we fall back to okta hosted flow
		try {
			const [{ interaction_handle }, authState] = await interact(req, res, {
				closeExistingSession: true,
			});

			const introspectResponse = await introspect(
				{
					interactionHandle: interaction_handle,
				},
				req.ip,
			);

			const updatedAuthState = updateAuthorizationStateData(authState, {
				socialProvider: socialIdp,
				stateToken: introspectResponse.stateHandle.split('~')[0],
			});

			setAuthorizationStateCookie(updatedAuthState, res);

			const introspectIdp = introspectResponse.remediation.value.find(
				({ name, type }) =>
					name === 'redirect-idp' && type === socialIdp.toUpperCase(),
			);

			if (introspectIdp && redirectIdpSchema.safeParse(introspectIdp).success) {
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
			logger.error('IDX API - Social sign in error:', error);
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
			},
		});
	}),
);

export default router.router;
