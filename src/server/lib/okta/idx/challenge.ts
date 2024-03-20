import { z } from 'zod';
import {
	IdxBaseResponse,
	IdxStateHandleBody,
	baseRemediationValueSchema,
	idxBaseResponseSchema,
	idxFetch,
} from './shared';
import { selectAuthenticationEnrollSchema } from './enroll';

const skipSchema = baseRemediationValueSchema.merge(
	z.object({
		name: z.literal('skip'),
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

export const challengeAnswer = (
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
