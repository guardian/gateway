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

/**
 * @name submitPasscode
 * @description Submit a passcode to Okta to answer the passcode challenge using the `challenge/answer` endpoint and return the response
 *
 * @param passcode The passcode to submit
 * @param stateHandle The state handle from the `identify`/`introspect` step
 * @param introspectRemediation The remediation object name to validate the introspect response against
 * @param requestId The request id
 * @param ip The IP address of the user
 * @returns Promise<ChallengeAnswerResponse | CompleteLoginResponse> - The challenge answer response
 */
export const submitPasscode = async ({
	passcode,
	stateHandle,
	introspectRemediation,
	requestId,
	ip,
}: {
	passcode: string;
	stateHandle: string;
	introspectRemediation: IntrospectRemediationNames;
	requestId?: string;
	ip?: string;
}): Promise<ChallengeAnswerResponse | CompleteLoginResponse> => {
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
		requestId,
		ip,
	);

	// check if the remediation array contains the correct remediation object supplied
	// if it does, then we know the stateHandle is valid and we're in the correct state for
	// the current flow
	validateIntrospectRemediation(introspectResponse, introspectRemediation);

	// attempt to answer the passcode challenge, if this fails, it falls through to the catch block where we handle the error
	return challengeAnswer(stateHandle, { passcode }, requestId, ip);
};
