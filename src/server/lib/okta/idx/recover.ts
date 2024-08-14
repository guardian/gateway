import { z } from 'zod';
import {
	baseRemediationValueSchema,
	IdxBaseResponse,
	idxBaseResponseSchema,
	idxFetch,
	IdxStateHandleBody,
} from './shared';

// schema for the authenticator-verification-data object inside the recover response remediation object
export const authenticatorVerificationDataRemediationSchema =
	baseRemediationValueSchema.merge(
		z.object({
			name: z.literal('authenticator-verification-data'),
			value: z.array(
				z.union([
					z.object({
						name: z.literal('authenticator'),
						label: z.string(),
						form: z.object({
							value: z.array(
								z.object({
									name: z.enum(['id', 'methodType']),
									value: z.string().optional(),
								}),
							),
						}),
					}),
					z.object({
						name: z.literal('stateHandle'),
						value: z.string(),
					}),
				]),
			),
		}),
	);

// list of all possible remediations for the recover response
export const recoverRemediations = z.union([
	authenticatorVerificationDataRemediationSchema,
	baseRemediationValueSchema,
]);

// schema for the recover response
const recoverResponseSchema = idxBaseResponseSchema.merge(
	z.object({
		remediation: z.object({
			type: z.string(),
			value: z.array(recoverRemediations),
		}),
	}),
);
type RecoverResponse = z.infer<typeof recoverResponseSchema>;

/**
 * @name recover
 * @description Okta IDX API/Interaction Code flow - Start password recovery process.
 * @param stateHandle - The state handle from the `identify`/`introspect` step
 * @param request_id - The request id
 * @returns	Promise<RecoverResponse> - The recover response
 */
export const recover = (
	stateHandle: IdxBaseResponse['stateHandle'],
	request_id?: string,
): Promise<RecoverResponse> => {
	return idxFetch<RecoverResponse, IdxStateHandleBody>({
		path: 'recover',
		body: {
			stateHandle,
		},
		schema: recoverResponseSchema,
		request_id,
	});
};
