import { z } from 'zod';
import { logger } from '@/client/lib/clientSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';

// Define the authenticators that can be used with the IDX API
export type Authenticators = 'email' | 'password';

// Schema to check the version of the IDX API, and warn if it's not 1.0.0
const idxVersionSchema = z.string().refine((val) => {
	// warn if the version is not 1.0.0
	if (val !== '1.0.0') {
		logger.warn('Okta IDX - unexpected version:', val);
		trackMetric('OktaIDX::UnexpectedVersion');
	}

	// but pass validation regardless
	return true;
});

// Base schema for the IDX API response, everything should inherit from this (using .merge)
export const idxBaseResponseSchema = z.object({
	version: idxVersionSchema,
	stateHandle: z.string(),
	expiresAt: z.string(),
});
export type IdxBaseResponse = z.infer<typeof idxBaseResponseSchema>;

// Base schema for the remediation object in the IDX API response
// Used in cases where the Okta IDX API during the authentication process
export const baseRemediationValueSchema = z.object({
	name: z.string(),
	type: z.string().optional(),
	href: z.string().url().optional(),
	method: z.string().optional(),
	value: z.unknown().optional(),
});

// Base type for the body of a request to the IDX API
// Which should include the stateHandle, and any other data needed using the generic type
export type IdxStateHandleBody<T = object> = T & {
	stateHandle: IdxBaseResponse['stateHandle'];
};

// schema for the select-authenticator-{enroll|authenticate}
export const selectAuthenticatorValueSchema = z.array(
	z.union([
		z.object({
			name: z.literal('authenticator'),
			type: z.string(),
			options: z.array(
				z.object({
					label: z.string(),
					value: z.object({
						form: z.object({
							value: z.array(
								z.object({
									name: z.enum(['id', 'methodType']),
									value: z.string(),
								}),
							),
						}),
					}),
				}),
			),
		}),
		z.object({
			name: z.literal('stateHandle'),
		}),
	]),
);

// schema for the select-authenticator-enroll object
export const selectAuthenticationEnrollSchema =
	baseRemediationValueSchema.merge(
		z.object({
			name: z.literal('select-authenticator-enroll'),
			value: selectAuthenticatorValueSchema,
		}),
	);

// schema for the (challenge|enroll)-authenticator remediation value object
export const authenticatorAnswerSchema = z.array(
	z.union([
		z.object({
			name: z.literal('credentials'),
			form: z.object({
				value: z.array(z.object({ name: z.literal('passcode') })),
			}),
		}),
		z.object({
			name: z.literal('stateHandle'),
		}),
	]),
);

// schema for the challenge-authenticator object inside the challenge/identify response remediation object
export const challengeAuthenticatorSchema = baseRemediationValueSchema.merge(
	z.object({
		name: z.literal('challenge-authenticator'),
		value: authenticatorAnswerSchema,
	}),
);

// Body type for the credential/enroll and challenge requests to select a given authenticator
export type AuthenticatorBody = IdxStateHandleBody<{
	authenticator: {
		id: string;
		methodType: Authenticators;
	};
}>;

// Type to extract all the `name` properties from the remediation value array
export type ExtractLiteralRemediationNames<T> = T extends { name: infer N }
	? N extends string
		? string extends N
			? never
			: N
		: never
	: never;

/**
 * @name validateRemediation
 * @description Validate that the IDX response contains the expected remediation based on the response type and the remediation name.
 *
 * Either throws an error or returns a boolean based on the `useThrow` parameter.
 *
 * This should not be used directly, but rather through the specific remediation validation functions which are exported from the Okta IDX API function files.
 *
 * @param response - The IDX response object (ResponseType)
 * @param remediationName - The name of the remediation to validate (RemediationNamesType), extracted from the response object and ExtractLiteralRemediationNames
 * @param useThrow - Whether to throw an error if the remediation is not found (default: true)
 * @returns boolean | void - Whether the remediation was found in the response
 */
export const validateRemediation = <
	ResponseType extends { remediation: { value: Array<{ name: string }> } },
	RemediationNamesType extends ExtractLiteralRemediationNames<
		ResponseType['remediation']['value'][number]
	>,
>(
	response: ResponseType,
	remediationName: RemediationNamesType,
	useThrow = true,
) => {
	const hasRemediation = response.remediation.value.some(
		({ name }) => name === remediationName,
	);

	if (!hasRemediation && useThrow) {
		throw new Error(
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			`IDX response does not contain the expected remediation: ${remediationName}`,
		);
	}

	return hasRemediation;
};
