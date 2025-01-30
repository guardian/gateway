import crypto from 'node:crypto';
import { Request } from 'express';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { isBreachedPassword } from '@/server/lib/breachedPasswordCheck';
import {
	readEncryptedStateCookie,
	setEncryptedStateCookie,
	updateEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { isOktaError } from '@/server/lib/okta/api/errors';
import { getUser, getUserGroups } from '@/server/lib/okta/api/users';
import {
	challenge,
	validateChallengeRemediation,
	isChallengeAnswerCompleteLoginResponse,
	validateChallengeAnswerRemediation,
} from '@/server/lib/okta/idx/challenge';
import { credentialEnroll } from '@/server/lib/okta/idx/credential';
import {
	identify,
	IdentifyResponse,
	validateIdentifyRemediation,
} from '@/server/lib/okta/idx/identify';
import { findAuthenticatorId } from '@/server/lib/okta/idx/shared/findAuthenticatorId';
import { getLoginRedirectUrl } from '@/server/lib/okta/idx/shared/idxFetch';
import {
	submitPasscode,
	submitPassword,
} from '@/server/lib/okta/idx/shared/submitPasscode';
import {
	startIdxFlow,
	StartIdxFlowParams,
} from '@/server/lib/okta/idx/startIdxFlow';
import { sendOphanComponentEventFromQueryParamsServer } from '@/server/lib/ophan';
import { renderer } from '@/server/lib/renderer';
import { mergeRequestState } from '@/server/lib/requestState';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';
import { ResponseWithRequestState } from '@/server/models/Express';
import { OAuthError, OktaError } from '@/server/models/okta/Error';
import { changePasswordEmailIdx } from '@/server/controllers/sendChangePasswordEmail';
import {
	GatewayError,
	GenericErrors,
	RegistrationErrors,
	SignInErrors,
} from '@/shared/model/Errors';
import { convertExpiresAtToExpiryTimeInMs } from '@/server/lib/okta/idx/shared/convertExpiresAtToExpiryTimeInMs';
import { handlePasscodeError } from '@/server/lib/okta/idx/shared/errorHandling';
import { validateEmailAndPasswordSetSecurely } from '@/server/lib/okta/validateEmail';
import { UserResponse } from '@/server/models/okta/User';
import {
	forceUserIntoActiveState,
	sendVerifyEmailAuthenticatorIdx,
} from '@/server/controllers/oktaIdxShared';
import { RoutePaths } from '@/shared/model/Routes';

/**
 * @name SignInError
 * @description The error object to return from the sign in controllers
 */
interface SignInError {
	status: number;
	gatewayError: GatewayError;
}

/**
 * @name oktaSignInControllerErrorHandler
 * @description Handle errors from the Okta sign in controllers
 * @param error - The error to handle
 * @returns SignInError - The error object to return
 */
export const oktaSignInControllerErrorHandler = (
	error: unknown,
): SignInError => {
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
 * @name getUserForIdxSignIn
 * @description A wrapper around the getUser function to handle errors and convert them to the correct error type
 * @param {string} email - The email address of the user
 * @param {string} ip - The IP address of the user
 * @returns {Promise<UserResponse>} - The user object
 */
const getUserForIdxSignIn = async (
	email: string,
	ip?: string,
): Promise<UserResponse> => {
	const user = await getUser(email, ip).catch((error) => {
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

	return user;
};

/**
 * @name startIdxSignInFlow
 * @description Start the IDX flow to sign the user in, and return the identify response and user object. Shared between the password and passcode sign in controllers
 * @param {string} email - The email address of the user
 * @param {Request} req - Express request object
 * @param {ResponseWithRequestState} res - Express response object
 * @returns {Promise<[IdentifyResponse, UserResponse]>} - The identify response and user object
 */
const startIdxSignInFlow = async ({
	email,
	req,
	res,
	authorizationCodeFlowOptions = {},
}: {
	email: string;
	req: Request;
	res: ResponseWithRequestState;
	authorizationCodeFlowOptions?: StartIdxFlowParams['authorizationCodeFlowOptions'];
}): Promise<IdentifyResponse> => {
	// at this point the user will be in the ACTIVE state
	// start the IDX flow by calling interact and introspect
	const introspectResponse = await startIdxFlow({
		req,
		res,
		authorizationCodeFlowOptions,
	});

	// call "identify", essentially to start an authentication process
	const identifyResponse = await identify(
		introspectResponse.stateHandle,
		email,
		req.ip,
	);

	// validate that the response from the identify endpoint is the "select-authenticator-authenticate" remediation
	// which is what we expect when we want to authenticate the user
	validateIdentifyRemediation(
		identifyResponse,
		'select-authenticator-authenticate',
	);

	// return the response and user objects to the calling function
	return identifyResponse;
};

/**
 * @name oktaIdxApiSignInPasscodeController
 * @description Use the Okta IDX API to attempt to send the user a passcode to sign in
 * @param {Request} req - Express request object
 * @param {ResponseWithRequestState} res - Express response object
 * @param {boolean} loopDetectionFlag - Flag to detect if the user is in a loop
 * @param {string} emailSentPage - The page to redirect to when the passcode email is sent, defaults to /signin/code
 * @param {string} confirmationPagePath - The path to redirect to after the user has signed in, default undefined (user will be directed to returnUrl)
 * @returns {Promise<void>}
 */
export const oktaIdxApiSignInPasscodeController = async ({
	req,
	res,
	loopDetectionFlag = false,
	emailSentPage = '/signin/code',
	confirmationPagePath,
}: {
	req: Request;
	res: ResponseWithRequestState;
	loopDetectionFlag?: boolean;
	emailSentPage?: Extract<RoutePaths, '/signin/code' | '/register/email-sent'>;
	confirmationPagePath?: StartIdxFlowParams['authorizationCodeFlowOptions']['confirmationPagePath'];
}): Promise<void> => {
	const { email = '' } = req.body;

	try {
		// First we want to check the user status in Okta
		// to see if they are in the ACTIVE state
		// if they are not, we will force them into the ACTIVE state
		const user = await getUserForIdxSignIn(email, req.ip);

		// determine the user status and what action to take
		switch (user.status) {
			case 'ACTIVE': {
				/**
				 *
				 * If the user is ACTIVE, then they'll be in one of 3 states:
				 * 1. ACTIVE users - has email + password authenticator (okta idx email verified)
				 * 2. ACTIVE users - has only password authenticator (okta idx email not verified)
				 * 3. ACTIVE users - has only email authenticator (SOCIAL users - no password, or passcode only users (not implemented yet))
				 *
				 * We can identify the users state by calling the IDX API /identify endpoint
				 * and checking the authenticators available
				 *
				 * Depending on their state, we have to perform different steps to reset their password
				 *
				 * This only happens when the "Username enumeration protection" setting is disabled in Okta
				 * under Security > General > User enumeration prevention
				 *
				 * When this is enabled, the IDX API will behave the same for every user,
				 * regardless of their status
				 *
				 * When disabled, the IDX API will return different remediations based on the
				 * user's status, which is helpful for us to determine the correct flow
				 *
				 */
				// start the IDX flow to sign the user in and get the identify response and user object
				const identifyResponse = await startIdxSignInFlow({
					email,
					req,
					res,
					authorizationCodeFlowOptions: {
						confirmationPagePath,
					},
				});

				// check for the "email" authenticator, we can authenticate with email (passcode)
				// if this authenticator is present
				const emailAuthenticatorId = findAuthenticatorId({
					authenticator: 'email',
					response: identifyResponse,
					remediationName: 'select-authenticator-authenticate',
				});

				// we also check for the "password" authenticator, to identify the user state
				const passwordAuthenticatorId = findAuthenticatorId({
					authenticator: 'password',
					response: identifyResponse,
					remediationName: 'select-authenticator-authenticate',
				});

				// if the user has email authenticator, we can send them a passcode
				if (emailAuthenticatorId) {
					// user has email authenticator so:
					// 1. ACTIVE users - has email + password authenticator (okta idx email verified)
					// 3. ACTIVE users - has only email authenticator (SOCIAL users, no password)
					// these users can be sent a passcode to sign in

					// call the "challenge" endpoint to start the email challenge process
					// and send the user a passcode
					const challengeEmailResponse = await challenge(
						identifyResponse.stateHandle,
						{
							id: emailAuthenticatorId,
							methodType: 'email',
						},
						req.ip,
					);

					// track send metric
					trackMetric('OktaIdxSendPasscodeSignIn::Success');

					// set the encrypted state cookie to persist the email and stateHandle
					// which we need to persist during the passcode reset flow
					setEncryptedStateCookie(res, {
						email: user.profile.email,
						stateHandle: challengeEmailResponse.stateHandle,
						stateHandleExpiresAt: challengeEmailResponse.expiresAt,
						userState: passwordAuthenticatorId
							? 'ACTIVE_EMAIL_PASSWORD'
							: 'ACTIVE_EMAIL_ONLY',
					});

					return res.redirect(
						303,
						addQueryParamsToPath(emailSentPage, res.locals.queryParams),
					);
				}

				if (passwordAuthenticatorId) {
					// user has only password authenticator so they're in the
					// 2. ACTIVE users - has only password authenticator (okta idx email not verified)
					// We need to send these users a verification email with passcode to verify their
					// email before they can sign in.
					// See the method documentation for additional context
					await sendVerifyEmailAuthenticatorIdx({
						user,
						identifyResponse,
						passwordAuthenticatorId,
						req,
						res,
					});

					// track send metric
					trackMetric('OktaIdxSendPasscodeSignIn::Success');

					return res.redirect(
						303,
						addQueryParamsToPath(emailSentPage, res.locals.queryParams),
					);
				}

				// if they don't have either authenticator, we cannot authenticate the user
				// so throw an error
				throw new OktaError({
					code: 'E0000004',
					message: 'User does not have email or password authenticator',
				});
			}
			default: {
				// if a loop is detected, then throw early to prevent infinite loop
				if (loopDetectionFlag) {
					throw new OktaError({
						message: `Okta oktaIdxApiSignInPasscodeController failed with loop detection flag under non-ACTIVE user state ${user.status}`,
					});
				}

				try {
					// force the user into the ACTIVE state
					// either
					// 1. ACTIVE users - has email + password authenticator (okta idx email verified)
					// 2. ACTIVE users - has only password authenticator (okta idx email not verified)
					await forceUserIntoActiveState({
						req,
						user,
					});

					// call this method again to send the user a passcode as they'll now be in one of the ACTIVE states
					return oktaIdxApiSignInPasscodeController({
						req,
						res,
						loopDetectionFlag: true,
						emailSentPage,
						confirmationPagePath,
					});
				} catch (error) {
					logger.error(
						'Okta force active user failed',
						error instanceof OktaError ? error.message : error,
					);
					throw error;
				}
			}
		}
	} catch (error) {
		logger.error('Okta oktaIdxApiSignInPasscodeController failed', error);

		trackMetric('OktaIdxSendPasscodeSignIn::Failure');

		// we always want to show the email sent page, even if an error has occurred
		// to prevent user enumeration, so we mock the idx behaviour
		setEncryptedStateCookie(res, {
			email,
			stateHandle: `02.id.${crypto.randomBytes(30).toString('base64')}`, // generate a 40 character random string to use in the 46 character stateHandle
			stateHandleExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes in the future
			userState: 'NON_EXISTENT', // set the user state to non-existent, so we can handle this case if the user attempts to submit the passcode
		});

		return res.redirect(
			303,
			addQueryParamsToPath(emailSentPage, res.locals.queryParams),
		);
	}
};

/**
 * @name oktaIdxApiSignInController
 * @description Start the Okta IDX flow to attempt to sign the user in with a password
 *
 * @param {Request} req - Express request object
 * @param {ResponseWithRequestState} res - Express response object
 * @returns {Promise<void>}
 */
export const oktaIdxApiSignInController = async ({
	req,
	res,
}: {
	req: Request;
	res: ResponseWithRequestState;
}) => {
	// get the email and password from the request body if using passwords
	// or the "passcode" parameter is a hidden input, which is to determine if the
	// user is signing in with a passcode and not an actual passcode value
	const { email = '', password = '', passcode } = req.body;

	// determines the flow to sign in with, namely passcodes or passwords
	// usePasscode is determined by the existence of the passcode parameter in the request body
	// or the "usePasswordSignIn" flag in the query parameters
	// if the value exists, we're using passcodes
	// if the value does not exist, we're using passwords
	const usePasscode = passcode && !res.locals.queryParams.usePasswordSignIn;

	try {
		// only attempt to sign in with a passcode if the usePasscode flag is set
		// depending on the situations outlined above
		if (usePasscode) {
			// if the value exists, we're using passcodes
			const usePasscode = !!passcode;

			// if we do, hand off to the oktaIdxApiSignInPasscodeController
			if (usePasscode) {
				return oktaIdxApiSignInPasscodeController({ req, res });
			}
		}

		// Otherwise use password sign in

		// First we want to check the user status in Okta
		// to see if they are in the ACTIVE state
		// if they are not, we will not allow them to sign in
		const user = await getUserForIdxSignIn(email, req.ip);
		if (user.status !== 'ACTIVE') {
			// throw authentication error if user is not in the ACTIVE state
			throw new OktaError({
				code: 'E0000004',
				message: 'User is not in the ACTIVE state',
			});
		}

		// start the IDX flow to sign the user in and get the identify response and user object
		const identifyResponse = await startIdxSignInFlow({
			email,
			req,
			res,
		});

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
			identifyResponse.stateHandle,
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
		// with a password
		trackMetric('OktaIdxSignIn::Success');
		trackMetric('OktaPasswordSignInFlow::Success');

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
		trackMetric('OktaPasswordSignInFlow::Failure');

		const { status, gatewayError } = oktaSignInControllerErrorHandler(error);

		// if we're using passcodes, and the user is attempting to sign in with a password
		// on error show the password sign in page
		const errorPage: RoutePaths = usePasscode ? '/signin/password' : '/signin';

		const html = renderer(errorPage, {
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
 * @name oktaIdxApiSubmitPasscodeController
 * @description Controller to handle the passcode submission from the passcode email sent page
 *
 * @param {Request} req - Express request object
 * @param {ResponseWithRequestState} res - Express response object
 * @param {string} emailSentPage - The page to redirect to when the passcode email is sent, defaults to /signin/code
 * @param {string} expiredPage - The page to redirect to when the passcode email has expired, defaults to /signin/code/expired
 * @returns {Promise<void>}
 */
export const oktaIdxApiSubmitPasscodeController = async ({
	req,
	res,
	emailSentPage = '/signin/code',
	expiredPage = '/signin/code/expired',
}: {
	req: Request;
	res: ResponseWithRequestState;
	emailSentPage?: Extract<RoutePaths, '/signin/code' | '/register/email-sent'>;
	expiredPage?: Extract<RoutePaths, '/signin/code/expired' | '/register/email'>;
}) => {
	const { code } = req.body;

	const encryptedState = readEncryptedStateCookie(req);

	if (encryptedState?.stateHandle && code) {
		const { stateHandle, userState } = encryptedState;

		try {
			// check for non-existent user state
			// in this case throw an error to show the user the passcode is invalid
			if (userState === 'NON_EXISTENT') {
				throw new OAuthError({
					error: 'api.authn.error.PASSCODE_INVALID',
					error_description: RegistrationErrors.PASSCODE_INVALID,
				});
			}

			// attempt to answer the passcode challenge, if this fails, it falls through to the catch block where we handle the error
			const challengeAnswerResponse = await submitPasscode({
				passcode: code,
				stateHandle,
				introspectRemediation:
					// if the user is in the `ACTIVE_PASSWORD_ONLY` state, then when they sign in with a passcode
					// they will need the `select-authenticator-enroll` remediation to enroll in the email authenticator
					// other users will have the `challenge-authenticator` remediation
					userState === 'ACTIVE_PASSWORD_ONLY'
						? 'select-authenticator-enroll'
						: 'challenge-authenticator',
				ip: req.ip,
			});

			// user should be authenticated by this point, so check if the response is a complete login response
			// if not, we return an error
			if (!isChallengeAnswerCompleteLoginResponse(challengeAnswerResponse)) {
				throw new OAuthError({
					error: 'invalid_response',
					error_description:
						'Invalid challenge/answer response - no complete login response',
				});
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

			// if the user is not in the GuardianUser-EmailValidated group, we should update the user's emailValidated flag
			// as they've now validated their email
			if (!emailValidated) {
				await validateEmailAndPasswordSetSecurely({
					id: challengeAnswerResponse.user.value.id,
					ip: req.ip,
					flagStatus: true,
					updateEmail: true,
					updatePassword: false,
				});
			}

			// update the encrypted state cookie to show the passcode was used
			// so that if the user clicks back to the email sent page, they will be shown a message
			updateEncryptedStateCookie(req, res, {
				passcodeUsed: true,
				stateHandle: undefined,
				stateHandleExpiresAt: undefined,
				userState: undefined,
			});

			// continue allowing the user to log in
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

			// if the user has made it here, they've successfully authenticated
			trackMetric('OktaIdxSignIn::Success');
			trackMetric('OktaIdxPasscodeSignIn::Success');

			// redirect the user to set a global session and then back to completing the authorization flow
			return res.redirect(303, loginRedirectUrl);
		} catch (error) {
			// handle passcode specific error
			handlePasscodeError({
				error,
				req,
				res,
				emailSentPage,
				expiredPage,
			});

			// if we redirected away during the handlePasscodeError function, we can't redirect again
			if (res.headersSent) {
				return;
			}

			// log the error
			logger.error('Okta oktaIdxApiSignInPasscodeController failed', error);

			// error metric
			trackMetric('OktaIdxSignIn::Failure');
			trackMetric('OktaIdxPasscodeSignIn::Failure');

			// handle any other error, show generic error message
			const html = renderer(emailSentPage, {
				requestState: mergeRequestState(res.locals, {
					queryParams: {
						...res.locals.queryParams,
						emailSentSuccess: false,
					},
					pageData: {
						email: encryptedState?.email,
						timeUntilTokenExpiry: convertExpiresAtToExpiryTimeInMs(
							encryptedState?.stateHandleExpiresAt,
						),
						formError: {
							message: GenericErrors.DEFAULT,
							severity: 'UNEXPECTED',
						},
						token: code,
					},
				}),
				pageTitle: 'Check Your Inbox',
			});
			return res.type('html').send(html);
		}
	}
};
