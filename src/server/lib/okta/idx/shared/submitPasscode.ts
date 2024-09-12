import { OAuthError } from '@/server/models/okta/Error';
import {
	introspect,
	IntrospectRemediationNames,
	validateIntrospectRemediation,
} from '@/server/lib/okta/idx/introspect';
import {
	challengeAnswer,
	ChallengeAnswerResponse,
} from '@/server/lib/okta/idx/challenge';
import { CompleteLoginResponse } from './idxFetch';
import { validatePasswordFieldForOkta } from '@/server/lib/validatePasswordField';
import { isBreachedPassword } from '@/server/lib/breachedPasswordCheck';
import { PasswordFieldErrors } from '@/shared/model/Errors';

type Params = {
	stateHandle: string;
	introspectRemediation: IntrospectRemediationNames;
	ip?: string;
};

/**
 * @name submitPasscode
 * @description Submit a passcode to Okta to answer the passcode challenge using the `challenge/answer` endpoint and return the response
 *
 * @param passcode The passcode to submit
 * @param stateHandle The state handle from the `identify`/`introspect` step
 * @param introspectRemediation The remediation object name to validate the introspect response against
 * @param ip The IP address of the user
 * @returns Promise<ChallengeAnswerResponse | CompleteLoginResponse> - The challenge answer response
 */
export const submitPasscode = async ({
	passcode,
	stateHandle,
	introspectRemediation,
	ip,
}: Params & { passcode: string }): Promise<
	ChallengeAnswerResponse | CompleteLoginResponse
> => {
	// validate the code contains only numbers and is 6 characters long
	// The okta api will validate the input fully, but validating here will prevent unnecessary requests
	if (!/^\d{6}$/.test(passcode)) {
		throw new OAuthError(
			{
				error: 'api.authn.error.PASSCODE_INVALID',
				error_description: 'Passcode invalid', // this is ignored, and a error based on the `error` key is shown
			},
			400,
		);
	}

	// check the state handle is valid and we can proceed with the request
	const introspectResponse = await introspect(
		{
			stateHandle,
		},
		ip,
	);

	// check if the remediation array contains the correct remediation object supplied
	// if it does, then we know the stateHandle is valid and we're in the correct state for
	// the current flow
	validateIntrospectRemediation(introspectResponse, introspectRemediation);

	// attempt to answer the passcode challenge, if this fails, it falls through to the catch block where we handle the error
	return challengeAnswer(stateHandle, { passcode }, ip);
};

/**
 * @name submitPassword
 * @description Submit a password to Okta to answer the password challenge using the `challenge/answer` endpoint and return the response. Validation should be enabled as needed through the params, validatePasswordLength and validateBreachedPassword (both default to false).
 *
 * @param password The password to submit
 * @param stateHandle The state handle from the `identify`/`introspect` step
 * @param introspectRemediation The remediation object name to validate the introspect response against
 * @param ip The IP address of the user
 * @returns {Promise<ChallengeAnswerResponse | CompleteLoginResponse>} challengeAnswerResponse - The challenge answer response
 */
export const submitPassword = async ({
	password,
	stateHandle,
	introspectRemediation,
	validateBreachedPassword = false,
	validatePasswordLength = false,
	ip,
}: Params & {
	password: string;
	validatePasswordLength?: boolean;
	validateBreachedPassword?: boolean;
}): Promise<ChallengeAnswerResponse | CompleteLoginResponse> => {
	const introspectResponse = await introspect(
		{
			stateHandle,
		},
		ip,
	);

	validateIntrospectRemediation(introspectResponse, introspectRemediation);

	if (validatePasswordLength) {
		validatePasswordFieldForOkta(password);
	}

	if (validateBreachedPassword && (await isBreachedPassword(password))) {
		throw new OAuthError({
			error: 'password.common',
			error_description: PasswordFieldErrors.COMMON_PASSWORD,
		});
	}

	return challengeAnswer(stateHandle, { passcode: password }, ip);
};
