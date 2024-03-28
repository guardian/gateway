import { z } from 'zod';
import { InteractResponse } from './interact';
import {
	baseRemediationValueSchema,
	idxBaseResponseSchema,
	idxFetch,
} from './shared';

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
export const selectEnrollProfileSchema = baseRemediationValueSchema.merge(
	z.object({
		name: z.literal('select-enroll-profile'),
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
