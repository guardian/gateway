import { z } from 'zod';
import {
	IdxBaseResponse,
	IdxStateHandleBody,
	baseRemediationValueSchema,
	idxBaseResponseSchema,
	idxFetch,
	idxFetchCompletion,
} from './shared';
import { selectAuthenticationEnrollSchema } from './enroll';
import { ResponseWithRequestState } from '@/server/models/Express';
import { validateEmailAndPasswordSetSecurely } from '@/server/lib/okta/validateEmail';
import { logger } from '@/server/lib/serverSideLogger';

// Schema for the 'skip' object inside the challenge response remediation object
export const skipSchema = baseRemediationValueSchema.merge(
	z.object({
		name: z.literal('skip'),
		href: z.string().url(),
	}),
);

// Schema for the challenge/answer response
const challengeAnswerResponseSchema = idxBaseResponseSchema.merge(
	z.object({
		remediation: z.object({
			type: z.string(),
			value: z.array(
				z.union([
					selectAuthenticationEnrollSchema,
					skipSchema,
					baseRemediationValueSchema,
				]),
			),
		}),
	}),
);
type ChallengeAnswerResponse = z.infer<typeof challengeAnswerResponseSchema>;

// Body type for the challenge/answer request - passcode can refer to a OTP code or a password
type ChallengeAnswerPasswordBody = IdxStateHandleBody<{
	credentials: {
		passcode: string;
	};
}>;

/**
 * @name challengeAnswerPasscode
 * @description Okta IDX API/Interaction Code flow - Answer a challenge with a passcode (OTP code or password).
 *
 * @param stateHandle - The state handle from the previous step
 * @param body - The passcode object, containing the passcode
 * @param request_id - The request id
 * @returns Promise<ChallengeAnswerResponse> - The challenge answer response
 */
export const challengeAnswerPasscode = (
	stateHandle: IdxBaseResponse['stateHandle'],
	body: ChallengeAnswerPasswordBody['credentials'],
	request_id?: string,
): Promise<ChallengeAnswerResponse> => {
	return idxFetch<ChallengeAnswerResponse, ChallengeAnswerPasswordBody>({
		path: 'challenge/answer',
		body: {
			stateHandle,
			credentials: body,
		},
		schema: challengeAnswerResponseSchema,
		request_id,
	});
};

/**
 * @name setPasswordAndRedirect
 * @description Okta IDX API/Interaction Code flow - Answer a challenge with a password, and redirect the user to set a global session and then back to the app. This could be one the final possible steps in the authentication process.
 * @param stateHandle - The state handle from the previous step
 * @param body - The password object, containing the password
 * @param expressRes - The express response object
 * @param request_id - The request id
 * @returns Promise<void> - Performs a express redirect
 */
export const setPasswordAndRedirect = async (
	stateHandle: IdxBaseResponse['stateHandle'],
	body: ChallengeAnswerPasswordBody['credentials'],
	expressRes: ResponseWithRequestState,
	request_id?: string,
): Promise<void> => {
	const [completionResponse, redirectUrl] =
		await idxFetchCompletion<ChallengeAnswerPasswordBody>({
			path: 'challenge/answer',
			body: {
				stateHandle,
				credentials: body,
			},
			expressRes,
			request_id,
		});

	// set the validation flags in Okta
	const { id } = completionResponse.user.value;
	if (id) {
		await validateEmailAndPasswordSetSecurely(id);
	} else {
		logger.error(
			'Failed to set validation flags in Okta as there was no id',
			undefined,
			{
				request_id,
			},
		);
	}

	// redirect the user to set a global session and then back to completing the authorization flow
	return expressRes.redirect(303, redirectUrl);
};
