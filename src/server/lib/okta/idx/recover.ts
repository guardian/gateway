import { z } from 'zod';
import {
	IdxBaseResponse,
	idxBaseResponseSchema,
	idxFetch,
	IdxStateHandleBody,
	selectAuthenticatorValueSchema,
} from './shared';

// schema for the recover response
const recoverResponseSchema = idxBaseResponseSchema.merge(
	z.object({
		name: z.literal('authenticator-verification-data'),
		value: selectAuthenticatorValueSchema,
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
