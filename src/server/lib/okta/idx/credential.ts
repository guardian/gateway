import { z } from 'zod';
import {
	IdxBaseResponse,
	IdxStateHandleBody,
	baseRemediationValueSchema,
	idxBaseResponseSchema,
	idxFetch,
} from './shared';
import {
	enrollAuthenticatorSchema,
	selectAuthenticationEnrollSchema,
} from './enroll';
import { skipSchema } from './challenge';

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

type CredentialEnrollBody = IdxStateHandleBody<{
	authenticator: {
		id: string;
		methodType: 'password';
	};
}>;

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
