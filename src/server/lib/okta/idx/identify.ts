import { z } from 'zod';
import { idxFetch } from '@/server/lib/okta/idx/shared/idxFetch';
import {
	baseRemediationValueSchema,
	selectAuthenticatorValueSchema,
	idxBaseResponseSchema,
	IdxBaseResponse,
	challengeAuthenticatorSchema,
	ExtractLiteralRemediationNames,
	validateRemediation,
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
	challengeAuthenticatorSchema,
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
 * @param ip - The IP address of the user
 * @returns Promise<IdentifyResponse> - The identify response
 */
export const identify = (
	stateHandle: IdxBaseResponse['stateHandle'],
	email: string,
	ip?: string,
): Promise<IdentifyResponse> => {
	return idxFetch<IdentifyResponse, IdentifyBody>({
		path: 'identify',
		body: {
			stateHandle,
			identifier: email,
			rememberMe: true,
		},
		schema: identifyResponseSchema,
		ip,
	});
};

// Type to extract all the remediation names from the challenge/answer response
type IdentifyRemediationNames = ExtractLiteralRemediationNames<
	IdentifyResponse['remediation']['value'][number]
>;

/**
 * @name validateIdentifyRemediation
 * @description Validates that the identify response contains a remediation with the given name, throwing an error if it does not. This is useful for ensuring that the remediation we want to perform is available in the identify response, and the state is correct.
 * @param identifyResponse - The identify response
 * @param remediationName - The name of the remediation to validate
 * @param useThrow - Whether to throw an error if the remediation is not found (default: true)
 * @throws OAuthError - If the remediation is not found in the identify response
 * @returns boolean | void - Whether the remediation was found in the response
 */
export const validateIdentifyRemediation = validateRemediation<
	IdentifyResponse,
	IdentifyRemediationNames
>;
