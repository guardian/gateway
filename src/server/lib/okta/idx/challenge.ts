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

export const skipSchema = baseRemediationValueSchema.merge(
	z.object({
		name: z.literal('skip'),
		href: z.string().url(),
	}),
);

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

type ChallengeAnswerPasswordBody = IdxStateHandleBody<{
	credentials: {
		passcode: string;
	};
}>;

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

export const setPasswordAndRedirect = async (
	stateHandle: IdxBaseResponse['stateHandle'],
	body: ChallengeAnswerPasswordBody['credentials'],
	expressRes: ResponseWithRequestState,
	request_id?: string,
): Promise<void> => {
	return await idxFetchCompletion<ChallengeAnswerPasswordBody>({
		path: 'challenge/answer',
		body: {
			stateHandle,
			credentials: body,
		},
		expressRes,
		request_id,
	});
};
