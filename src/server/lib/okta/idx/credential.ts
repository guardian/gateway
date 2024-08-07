import { z } from 'zod';
import {
	IdxBaseResponse,
	IdxStateHandleBody,
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

// Body type for the credential/enroll request
type CredentialEnrollBody = IdxStateHandleBody<{
	authenticator: {
		id: string;
		methodType: 'password';
	};
}>;

/**
 * @name credentialEnroll
 * @description Okta IDX API/Interaction Code flow - Enroll a new credential (currently `password`) for the user.
 * @param stateHandle - The state handle from the `enroll` step
 * @param body - The credential object, containing the authenticator id and method type
 * @param request_id - The request id
 * @returns	Promise<CredentialEnrollResponse> - The credential enroll response
 */
export const credentialEnroll = (
	stateHandle: IdxBaseResponse['stateHandle'],
	body: CredentialEnrollBody['authenticator'],
	request_id?: string,
): Promise<CredentialEnrollResponse> => {
	return idxFetch<CredentialEnrollResponse, CredentialEnrollBody>({
		path: 'credential/enroll',
		body: {
			stateHandle,
			authenticator: body,
		},
		schema: credentialEnrollResponse,
		request_id,
	});
};
