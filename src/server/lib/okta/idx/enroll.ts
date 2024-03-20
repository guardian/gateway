import { z } from 'zod';
import {
	IdxBaseResponse,
	IdxStateHandleBody,
	baseRemediationValueSchema,
	idxBaseResponseSchema,
	idxFetch,
} from './shared';

const enrollProfileSchema = baseRemediationValueSchema.merge(
	z.object({
		name: z.literal('enroll-profile'),
	}),
);

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

type EnrollNewWithEmailBody = IdxStateHandleBody<{
	userProfile: {
		email: string;
		isGuardianUser: true;
		registrationLocation?: string;
		registrationPlatform?: string;
	};
}>;

const enrollAuthenticatorSchema = baseRemediationValueSchema.merge(
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

export const selectAuthenticationEnrollValueSchema = z.array(
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

export const selectAuthenticationEnrollSchema =
	baseRemediationValueSchema.merge(
		z.object({
			name: z.literal('select-authenticator-enroll'),
			value: selectAuthenticationEnrollValueSchema,
		}),
	);

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
