import { z } from 'zod';
import type { IdxBaseResponse, IdxStateHandleBody } from './shared';
import {
	baseRemediationValueSchema,
	idxBaseResponseSchema,
	idxFetch,
} from './shared';

// schema for the enroll-profile object inside the enroll response remediation object
const enrollProfileSchema = baseRemediationValueSchema.merge(
	z.object({
		name: z.literal('enroll-profile'),
	}),
);

// schema for the enroll response
const enrollResponseSchema = idxBaseResponseSchema.merge(
	z.object({
		remediation: z.object({
			type: z.string(),
			value: z.array(
				z.union([enrollProfileSchema, baseRemediationValueSchema]),
			),
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
 * @returns Promise<EnrollResponse> - The enroll response
 */
export const enroll = (
	stateHandle: IdxBaseResponse['stateHandle'],
	request_id?: string,
): Promise<EnrollResponse> => {
	return idxFetch<EnrollResponse, IdxStateHandleBody>({
		path: 'enroll',
		body: {
			stateHandle,
		},
		schema: enrollResponseSchema,
		request_id,
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
		value: z.array(
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
		),
	}),
);

// schema for the select-authenticator-enroll value object inside selectAuthenticationEnrollSchema
const selectAuthenticationEnrollValueSchema = z.array(
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

// schema for the select-authenticator-enroll object inside the enroll new response remediation object
export const selectAuthenticationEnrollSchema =
	baseRemediationValueSchema.merge(
		z.object({
			name: z.literal('select-authenticator-enroll'),
			value: selectAuthenticationEnrollValueSchema,
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
		currentAuthenticator: z.object({
			type: z.literal('object'),
			value: z.object({
				type: z.literal('email'),
				resend: z.object({
					name: z.literal('resend'),
				}),
			}),
		}),
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
 * @returns Promise<EnrollNewResponse> - The enroll new response
 */
export const enrollNewWithEmail = (
	stateHandle: IdxBaseResponse['stateHandle'],
	body: EnrollNewWithEmailBody['userProfile'],
	request_id?: string,
): Promise<EnrollNewResponse> => {
	return idxFetch<EnrollNewResponse, EnrollNewWithEmailBody>({
		path: 'enroll/new',
		body: {
			stateHandle,
			userProfile: body,
		},
		schema: enrollNewResponseSchema,
		request_id,
	});
};
