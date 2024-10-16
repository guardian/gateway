import { Request } from 'express';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { isBreachedPassword } from '@/server/lib/breachedPasswordCheck';
import { setEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
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
import { submitPassword } from '@/server/lib/okta/idx/shared/submitPasscode';
import { startIdxFlow } from '@/server/lib/okta/idx/startIdxFlow';
import { sendOphanComponentEventFromQueryParamsServer } from '@/server/lib/ophan';
import { renderer } from '@/server/lib/renderer';
import { mergeRequestState } from '@/server/lib/requestState';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';
import { ResponseWithRequestState } from '@/server/models/Express';
import { OAuthError, OktaError } from '@/server/models/okta/Error';
import { changePasswordEmailIdx } from '@/server/controllers/sendChangePasswordEmail';
import { GatewayError, SignInErrors } from '@/shared/model/Errors';
import { UserResponse } from '@/server/models/okta/User';

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
}: {
	email: string;
	req: Request;
	res: ResponseWithRequestState;
}): Promise<[IdentifyResponse, UserResponse]> => {
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

	// validate that the response from the identify endpoint is the "select-authenticator-authenticate" remediation
	// which is what we expect when we want to authenticate the user
	validateIdentifyRemediation(
		identifyResponse,
		'select-authenticator-authenticate',
	);

	// return the response and user objects to the calling function
	return [identifyResponse, user];
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
	// get the email and password from the request body
	const { email = '', password = '' } = req.body;

	try {
		// start the IDX flow to sign the user in and get the identify response and user object
		const [identifyResponse, user] = await startIdxSignInFlow({
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
