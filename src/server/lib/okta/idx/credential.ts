import { z } from 'zod';
import {
	AuthenticatorBody,
	IdxBaseResponse,
	baseRemediationValueSchema,
	idxBaseResponseSchema,
	idxFetch,
	selectAuthenticationEnrollSchema,
} from './shared';
import { enrollAuthenticatorSchema } from './enroll';
import { skipSchema } from './challenge';

// Schema for the credential/enroll response - very similar to the enroll response
const credentialEnrollResponse = idxBaseResponseSchema.merge(
	z.object({
		remediation: z.object({
			type: z.string(),
			value: z.array(
				z.union([
					enrollAuthenticatorSchema,
					selectAuthenticationEnrollSchema,
					skipSchema,
					baseRemediationValueSchema,
				]),
			),
		}),
	}),
);
type CredentialEnrollResponse = z.infer<typeof credentialEnrollResponse>;

/**
 * @name credentialEnroll
 * @description Okta IDX API/Interaction Code flow - Enroll a new credential (currently `email` or `password`) for the user.
 * @param stateHandle - The state handle from the `enroll` step
 * @param body - The authenticator object, containing the authenticator id and method type
 * @param request_id - The request id
 * @returns	Promise<CredentialEnrollResponse> - The credential enroll response
 */
export const credentialEnroll = (
	stateHandle: IdxBaseResponse['stateHandle'],
	body: AuthenticatorBody['authenticator'],
	request_id?: string,
): Promise<CredentialEnrollResponse> => {
	return idxFetch<CredentialEnrollResponse, AuthenticatorBody>({
		path: 'credential/enroll',
		body: {
			stateHandle,
			authenticator: body,
		},
		schema: credentialEnrollResponse,
		request_id,
	});
};
