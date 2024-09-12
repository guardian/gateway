import { z } from 'zod';
import { enrollAuthenticatorSchema } from '@/server/lib/okta/idx/enroll';
import { skipSchema } from '@/server/lib/okta/idx/challenge';
import { idxFetch } from '@/server/lib/okta/idx/shared/idxFetch';
import {
	selectAuthenticationEnrollSchema,
	baseRemediationValueSchema,
	idxBaseResponseSchema,
	IdxBaseResponse,
	AuthenticatorBody,
} from '@/server/lib/okta/idx/shared/schemas';

// list of all possible remediations for the credential/enroll response
export const credentialEnrollRemediations = z.union([
	enrollAuthenticatorSchema,
	selectAuthenticationEnrollSchema,
	skipSchema,
	baseRemediationValueSchema,
]);

// Schema for the credential/enroll response - very similar to the enroll response
const credentialEnrollResponse = idxBaseResponseSchema.merge(
	z.object({
		remediation: z.object({
			type: z.string(),
			value: z.array(credentialEnrollRemediations),
		}),
	}),
);
type CredentialEnrollResponse = z.infer<typeof credentialEnrollResponse>;

/**
 * @name credentialEnroll
 * @description Okta IDX API/Interaction Code flow - Enroll a new credential (currently `email` or `password`) for the user.
 * @param stateHandle - The state handle from the `enroll` step
 * @param body - The authenticator object, containing the authenticator id and method type
 * @param ip - The IP address of the user
 * @returns	Promise<CredentialEnrollResponse> - The credential enroll response
 */
export const credentialEnroll = (
	stateHandle: IdxBaseResponse['stateHandle'],
	body: AuthenticatorBody['authenticator'],
	ip?: string,
): Promise<CredentialEnrollResponse> => {
	return idxFetch<CredentialEnrollResponse, AuthenticatorBody>({
		path: 'credential/enroll',
		body: {
			stateHandle,
			authenticator: body,
		},
		schema: credentialEnrollResponse,
		ip,
	});
};
