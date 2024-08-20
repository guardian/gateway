import { z } from 'zod';
import { idxFetch } from '@/server/lib/okta/idx/shared/idxFetch';
import {
	baseRemediationValueSchema,
	selectAuthenticatorValueSchema,
	idxBaseResponseSchema,
	IdxBaseResponse,
} from '@/server/lib/okta/idx/shared/schemas';

// schema for the select-authenticator-authenticate object inside the identify response remediation object
export const selectAuthenticationAuthenticateSchema =
	baseRemediationValueSchema.merge(
		z.object({
			name: z.literal('select-authenticator-authenticate'),
			value: selectAuthenticatorValueSchema,
		}),
	);

// list of all possible remediations for the identify response
export const identifyRemediations = z.union([
	selectAuthenticationAuthenticateSchema,
	baseRemediationValueSchema,
]);

// schema for the identify response
const identifyResponseSchema = idxBaseResponseSchema.merge(
	z.object({
		remediation: z.object({
			type: z.string(),
			value: z.array(identifyRemediations),
		}),
	}),
);
type IdentifyResponse = z.infer<typeof identifyResponseSchema>;

// Body type for the identify request
type IdentifyBody = {
	stateHandle: IdxBaseResponse['stateHandle'];
	identifier: string;
	rememberMe: true;
};

/**
 * @name identify
 * @description Okta IDX API/Interaction Code flow - Use the stateHandle from the `introspect` step to start the identify process. This is used when authenticating an existing user.
 *
 * @param stateHandle - The state handle from the `introspect` step
 * @param email - The email address of the user
 * @param request_id - The request id
 * @returns Promise<IdentifyResponse> - The identify response
 */
export const identify = (
	stateHandle: IdxBaseResponse['stateHandle'],
	email: string,
	request_id?: string,
): Promise<IdentifyResponse> => {
	return idxFetch<IdentifyResponse, IdentifyBody>({
		path: 'identify',
		body: {
			stateHandle,
			identifier: email,
			rememberMe: true,
		},
		schema: identifyResponseSchema,
		request_id,
	});
};
