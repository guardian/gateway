import { Request } from 'express';
import { setEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import dangerouslySetPlaceholderPassword from '@/server/lib/okta/dangerouslySetPlaceholderPassword';
import {
	challenge,
	validateChallengeRemediation,
	isChallengeAnswerCompleteLoginResponse,
	validateChallengeAnswerRemediation,
} from '@/server/lib/okta/idx/challenge';
import { credentialEnroll } from '@/server/lib/okta/idx/credential';
import { findAuthenticatorId } from '@/server/lib/okta/idx/shared/findAuthenticatorId';
import { submitPassword } from '@/server/lib/okta/idx/shared/submitPasscode';
import { trackMetric } from '@/server/lib/trackMetric';
import { OktaError } from '@/server/models/okta/Error';
import { UserResponse } from '@/server/models/okta/User';
import { ResponseWithRequestState } from '@/server/models/Express';
import { IdentifyResponse } from '@/server/lib/okta/idx/identify';
import {
	resetPassword,
	validateRecoveryToken,
} from '@/server/lib/okta/api/authentication';
import { deactivateUser, activateUser } from '@/server/lib/okta/api/users';
import { validateEmailAndPasswordSetSecurely } from '@/server/lib/okta/validateEmail';
import { logger } from '@/server/lib/serverSideLogger';

/**
 * @name sendVerifyEmailAuthenticatorIdx
 * @description IMPORTANT: Use this method to send a email verification email to the user in the ACTIVE_PASSWORD_ONLY state. Please read the following:
 *
 * When a user only has the password authenticator, they have not yet verified their email factor in okta using a passcode.
 *
 * A user can get into this state when they fail to verify their email using a passcode during the create account flow, and
 * they attempt to recover their account using the Okta Classic API reset password flow (no longer the default, but some users
 * can still be in this state), therefore they are left with the password authenticator, but no email authenticator.
 *
 * We say that the user is in the follow state:
 * ACTIVE_PASSWORD_ONLY - 2. ACTIVE users - has only password authenticator (okta idx email not verified)
 *
 * In order to fix these users, we have to send them a passcode to verify their email factor in Okta using the IDX API, but in
 * order to do so we have to first authenticate them.
 *
 * We do this by setting a placeholder password for the user, making sure to unset the `emailValidated` and `passwordSetSecurely`
 * flags if they are current set to `true`.
 * We then use the placeholder password to authenticate the user using the password authenticator in the IDX API.
 * When we do so, the IDX API will tell us that the user needs to enroll in the `email` authenticator, which we use to send
 * the user a passcode to verify the `email` authenticator.
 *
 * This method sends the passcode, and sets the encrypted state cookie to persist the email and stateHandle. To use this method
 * the IDX API transaction must be in the `IdentifyResponse` state, and the `passwordAuthenticatorId` must be known.
 *
 * Since this method doesn't return anything, any redirects or responses should be handled in the calling function.
 *
 * This method doesn't handle the passcode submission, that should be handled depending on the context and user flow.
 *
 * @param {UserResponse} user - The user object from Okta
 * @param {IdentifyResponse} identifyResponse - The response from the identify endpoint
 * @param {string} passwordAuthenticatorId - The password authenticator id
 * @param {Request} req - The express request object
 * @param {ResponseWithRequestState} res - The express response object
 */
export const sendVerifyEmailAuthenticatorIdx = async ({
	user,
	identifyResponse,
	passwordAuthenticatorId,
	req,
	res,
}: {
	user: UserResponse;
	identifyResponse: IdentifyResponse;
	passwordAuthenticatorId: string;
	req: Request;
	res: ResponseWithRequestState;
}) => {
	// set a placeholder password for the user
	const placeholderPassword = await dangerouslySetPlaceholderPassword({
		id: user.id,
		ip: req.ip,
		returnPlaceholderPassword: true,
	});

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
	validateChallengeRemediation(
		challengePasswordResponse,
		'challenge-authenticator',
		'password',
	);

	// call "challenge/answer" to answer the password challenge
	const challengeAnswerResponse = await submitPassword({
		password: placeholderPassword,
		stateHandle: challengePasswordResponse.stateHandle,
		introspectRemediation: 'challenge-authenticator',
		ip: req.ip,
	});

	// check the response from the challenge/answer endpoint
	// if it's a "CompleteLoginResponse" then Okta is in the state
	// where email verification or enrollment is disabled, and a user
	// can authenticate with a password only
	// in this case we want to fall back to the classic reset password flow
	// as this is the only way for these users to reset their password while
	// Okta is in this state
	if (isChallengeAnswerCompleteLoginResponse(challengeAnswerResponse)) {
		// track the metric so we can see if we accidentally hit this case
		trackMetric('OktaIDXEmailVerificationDisabled');
		// throw an error to fall back to the classic reset password flow
		throw new OktaError({
			message: `Okta changePasswordEmailIdx failed as email verification or enrollment is disabled in Okta`,
		});
	}

	// otherwise the response is a "ChallengeAnswerResponse" and we can continue
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
			message: `Okta sendVerifyEmailAuthenticatorIdx failed as email authenticator id is not found in the response`,
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
	// which we need to persist during the passcode flow
	setEncryptedStateCookie(res, {
		email: user.profile.email,
		stateHandle: challengeEmailResponse.stateHandle,
		stateHandleExpiresAt: challengeEmailResponse.expiresAt,
		userState: 'ACTIVE_PASSWORD_ONLY',
	});
};

/**
 * @name forceUserIntoActiveState
 * @description IMPORTANT: Use this method to force a user into the ACTIVE state from a non-ACTIVE state. Please read the following:
 *
 * In order for a user in a non-ACTIVE state to be able to receive a passcode, they must be in the ACTIVE state, so we have to
 * force them into the ACTIVE state.
 *
 * The best way to do this is to first deactivate the user, which works on all user states and puts them
 * into the DEPROVISIONED state.
 * Then we can activate the user, which will put them into the PROVISIONED state and return us a recovery token.
 * We then use the recovery token to set a placeholder password for the user, which transitions them into the ACTIVE state,
 * and also makes sure to unset the `emailValidated` and `passwordSetSecurely` flags if they are currently set to `true`.
 *
 * This will put the user in one of the following ACTIVE states:
 * 1. ACTIVE users - has email + password authenticator (okta idx email verified)
 * 2. ACTIVE users - has only password authenticator (okta idx email not verified)
 *
 * They can't be in the 3. ACTIVE users - has only email authenticator (SOCIAL users, no password), as these users will
 * have a password.
 *
 * From this point the calling function will be able to send the user a passcode.
 */
export const forceUserIntoActiveState = async ({
	req,
	user,
}: {
	req: Request;
	user: UserResponse;
}) => {
	// 1. deactivate the user
	try {
		await deactivateUser({
			id: user.id,
			ip: req.ip,
		});
		trackMetric('OktaDeactivateUser::Success');
	} catch (error) {
		trackMetric('OktaDeactivateUser::Failure');
		logger.error(
			'Okta user deactivation failed',
			error instanceof OktaError ? error.message : error,
		);
		throw error;
	}

	// 2. activate the user
	try {
		const tokenResponse = await activateUser({
			id: user.id,
			ip: req.ip,
		});
		if (!tokenResponse?.token.length) {
			throw new OktaError({
				message: `Okta force activation failed: missing activation token`,
			});
		}

		// 3. use the recovery token to set a placeholder password for the user
		// Validate the token
		const { stateToken } = await validateRecoveryToken({
			recoveryToken: tokenResponse.token,
			ip: req.ip,
		});
		// Check if state token is defined
		if (!stateToken) {
			throw new OktaError({
				message:
					'Okta set placeholder password failed: state token is undefined',
			});
		}
		// Set the placeholder password as a cryptographically secure UUID
		const placeholderPassword = crypto.randomUUID();
		await resetPassword(
			{
				stateToken,
				newPassword: placeholderPassword,
			},
			req.ip,
		);

		// Unset the emailValidated and passwordSetSecurely flags
		await validateEmailAndPasswordSetSecurely({
			id: user.id,
			ip: req.ip,
			flagStatus: false,
		});
	} catch (error) {
		logger.error(
			'Okta force activation failed',
			error instanceof OktaError ? error.message : error,
		);
		throw error;
	}
};
