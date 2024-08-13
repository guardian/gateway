import { z } from 'zod';
import { InteractResponse } from './interact';
import {
	baseRemediationValueSchema,
	idxBaseResponseSchema,
	idxFetch,
} from './shared';
import { OAuthError } from '@/server/models/okta/Error';

// Schema for the 'redirect-idp' object inside the introspect response remediation object
export const redirectIdpSchema = baseRemediationValueSchema.merge(
	z.object({
		name: z.literal('redirect-idp'),
		type: z.enum(['APPLE', 'GOOGLE']),
		href: z.string().url(),
		method: z.literal('GET'),
	}),
);

// Base schema for the 'select-enroll-profile' object inside the introspect response remediation object
const selectEnrollProfileSchema = baseRemediationValueSchema.merge(
	z.object({
		name: z.literal('select-enroll-profile'),
	}),
);

// Schema for the 'identify' object inside the introspect response remediation object
const identifySchema = baseRemediationValueSchema.merge(
	z.object({
		name: z.literal('identify'),
	}),
);

// Schema for the introspect response
const introspectResponseSchema = idxBaseResponseSchema.merge(
	z.object({
		remediation: z.object({
			type: z.string(),
			value: z.array(
				// social idp object
				z.union([
					redirectIdpSchema,
					selectEnrollProfileSchema,
					identifySchema,
					baseRemediationValueSchema,
				]),
			),
		}),
	}),
);
export type IntrospectResponse = z.infer<typeof introspectResponseSchema>;

// Introspect body type - can use either interactionHandle or stateHandle
type IntrospectBody =
	| {
			interactionHandle: InteractResponse['interaction_handle'];
	  }
	| {
			stateHandle: IntrospectResponse['stateHandle'];
	  };

/**
 * @name introspect
 * @description Okta IDX API/Interaction Code flow - Step 2: Use the interaction handle generated from the `interact` step to start the authentication process.
 *
 * The introspect step lets us know what kind of authentication we can perform (remediation),
 * and what the next steps are. It also returns the `stateHandle` which identifies the current
 * state of the authentication process, and should be preserved and used in any subsequent requests
 * in the flow.
 *
 * @param interactionHandle - The interaction handle returned from the `interact` step
 * @param request_id - The request id
 * @returns Promise<IntrospectResponse> - The introspect response
 */
export const introspect = (
	body: IntrospectBody,
	request_id?: string,
): Promise<IntrospectResponse> => {
	return idxFetch<IntrospectResponse, IntrospectBody>({
		path: 'introspect',
		body,
		schema: introspectResponseSchema,
		request_id,
	});
};

/**
 * @name validateIntrospectRemediation
 * @description Validates that the introspect response contains a remediation with the given name, throwing an error if it does not. This is useful for ensuring that the remediation we want to perform is available in the introspect response, and the state is correct.
 * @param introspectResponse - The introspect response
 * @param remediationName - The name of the remediation to validate
 * @throws OAuthError - If the remediation is not found in the introspect response
 * @returns void
 */
export const validateIntrospectRemediation = (
	introspectResponse: IntrospectResponse,
	remediationName: string,
) => {
	const hasRemediation = introspectResponse.remediation.value.some(
		({ name }) => name === remediationName,
	);

	if (!hasRemediation) {
		throw new OAuthError(
			{
				error: 'invalid_request',
				error_description: `Remediation ${remediationName} not found in introspect response`,
			},
			400,
		);
	}
};
