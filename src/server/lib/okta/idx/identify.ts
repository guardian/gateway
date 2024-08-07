import { z } from 'zod';
import {
	baseRemediationValueSchema,
	IdxBaseResponse,
	idxBaseResponseSchema,
	idxFetch,
	selectAuthenticatorValueSchema,
} from './shared';

// schema for the select-authenticator-authenticate object inside the identify response remediation object
const selectAuthenticationAuthenticateSchema = baseRemediationValueSchema.merge(
	z.object({
		name: z.literal('select-authenticator-authenticate'),
		value: selectAuthenticatorValueSchema,
	}),
);

// schema for the identify response
const identifyResponseSchema = idxBaseResponseSchema.merge(
	z.object({
		remediation: z.object({
			type: z.string(),
			value: z.array(
				z.union([
					selectAuthenticationAuthenticateSchema,
					baseRemediationValueSchema,
				]),
			),
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
