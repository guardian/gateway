import { z } from 'zod';
import { idxFetch } from '@/server/lib/okta/idx/shared/idxFetch';
import {
	baseRemediationValueSchema,
	idxBaseResponseSchema,
	IdxBaseResponse,
	IdxStateHandleBody,
	authenticatorAnswerSchema,
	selectAuthenticationEnrollSchema,
	ExtractLiteralRemediationNames,
	validateRemediation,
} from '@/server/lib/okta/idx/shared/schemas';

// schema for the enroll-profile object inside the enroll response remediation object
const enrollProfileSchema = baseRemediationValueSchema.merge(
	z.object({
		name: z.literal('enroll-profile'),
	}),
);

// list of all possible remediations for the enroll response
export const enrollRemediations = z.union([
	enrollProfileSchema,
	baseRemediationValueSchema,
]);

// schema for the enroll response
const enrollResponseSchema = idxBaseResponseSchema.merge(
	z.object({
		remediation: z.object({
			type: z.string(),
			value: z.array(enrollRemediations),
		}),
	}),
);
type EnrollResponse = z.infer<typeof enrollResponseSchema>;

/**
 * @name enroll
 * @description Okta IDX API/Interaction Code flow - Use the stateHandle from the `introspect` step to start the enrollment process. This is used when registration a new user. Has to be called before `enrollNewWithEmail`.
 *
 * @param stateHandle - The state handle from the `introspect` step
 * @param request_id - The request id
 * @param ip - The IP address of the user
 * @returns Promise<EnrollResponse> - The enroll response
 */
export const enroll = (
	stateHandle: IdxBaseResponse['stateHandle'],
	request_id?: string,
	ip?: string,
): Promise<EnrollResponse> => {
	return idxFetch<EnrollResponse, IdxStateHandleBody>({
		path: 'enroll',
		body: {
			stateHandle,
		},
		schema: enrollResponseSchema,
		request_id,
		ip,
	});
};

// Request body type for the enroll/new endpoint
type EnrollNewWithEmailBody = IdxStateHandleBody<{
	userProfile: {
		email: string;
		isGuardianUser: true;
		registrationLocation?: string;
		registrationPlatform?: string;
	};
}>;

// schema for the enroll-authenticator object inside the enroll new response remediation object
export const enrollAuthenticatorSchema = baseRemediationValueSchema.merge(
	z.object({
		name: z.literal('enroll-authenticator'),
		value: authenticatorAnswerSchema,
	}),
);

// schema for the enroll/new response
const enrollNewResponseSchema = idxBaseResponseSchema.merge(
	z.object({
		remediation: z.object({
			type: z.literal('array'),
			value: z.array(
				z.union([
					enrollAuthenticatorSchema,
					selectAuthenticationEnrollSchema,
					baseRemediationValueSchema,
				]),
			),
		}),
		currentAuthenticator: z
			.object({
				type: z.literal('object'),
				value: z.object({
					type: z.literal('email'),
					resend: z.object({
						name: z.literal('resend'),
					}),
				}),
			})
			.optional(),
	}),
);
type EnrollNewResponse = z.infer<typeof enrollNewResponseSchema>;

/**
 * @name enrollNewWithEmail
 * @description Okta IDX API/Interaction Code flow - Enroll a new user with an email address. This is used when registering a new user. Should be called after `enroll`.
 *
 * @param stateHandle - The state handle from the `enroll`/`introspect` step
 * @param body - The user profile object, containing the email address
 * @param request_id - The request id
 * @param ip - The IP address of the user
 * @returns Promise<EnrollNewResponse> - The enroll new response
 */
export const enrollNewWithEmail = (
	stateHandle: IdxBaseResponse['stateHandle'],
	body: EnrollNewWithEmailBody['userProfile'],
	request_id?: string,
	ip?: string,
): Promise<EnrollNewResponse> => {
	return idxFetch<EnrollNewResponse, EnrollNewWithEmailBody>({
		path: 'enroll/new',
		body: {
			stateHandle,
			userProfile: body,
		},
		schema: enrollNewResponseSchema,
		request_id,
		ip,
	});
};

// Type to extract all the remediation names from the enroll/new response
export type EnrollNewRemediationNames = ExtractLiteralRemediationNames<
	EnrollNewResponse['remediation']['value'][number]
>;

/**
 * @name validateEnrollNewRemediation
 * @description Validates that the enroll/new response contains a remediation with the given name, throwing an error if it does not. This is useful for ensuring that the remediation we want to perform is available in the enroll/new response, and the state is correct.
 * @param enrollNewResponse - The enroll/new response
 * @param remediationName - The name of the remediation to validate
 * @param useThrow - Whether to throw an error if the remediation is not found
 * @throws OAuthError - If the remediation is not found in the enroll/new response
 * @returns boolean | void - Whether the remediation was found in the response
 */
export const validateEnrollNewRemediation = validateRemediation<
	EnrollNewResponse,
	EnrollNewRemediationNames
>;
