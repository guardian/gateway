import {
	CompleteLoginResponse,
	completeLoginResponseSchema,
	idxFetch,
} from '@/server/lib/okta/idx/shared/idxFetch';
import { IdxBaseResponse, IdxStateHandleBody } from './shared/schemas';

/**
 * @name skip
 * @description Okta IDX API/Interaction Code flow - Skip an optional credential enrollment step.
 *
 * @param stateHandle - The state handle from the previous step
 * @param ip - The ip address
 * @returns Promise<CompleteLoginResponse> - The complete login response
 */
export const skip = (
	stateHandle: IdxBaseResponse['stateHandle'],
	ip?: string,
): Promise<CompleteLoginResponse> => {
	return idxFetch<CompleteLoginResponse, IdxStateHandleBody>({
		path: 'skip',
		body: {
			stateHandle,
		},
		schema: completeLoginResponseSchema,
		ip,
	});
};
