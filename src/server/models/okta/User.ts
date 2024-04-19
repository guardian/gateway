// for some reason, we can't use @/shared/model/RegisterLocation here, as this breaks cypress, so use relative path instead ¯\_(ツ)_/¯
import { RegistrationLocationSchema } from '../../../shared/model/RegistrationLocation';
import { z } from 'zod';

// social registration identity provider type
// we've removed facebook as an authentication option, but we still need to support existing users
// who initially registered with facebook
const RegistrationIdp = z.enum(['google', 'apple', 'facebook']);

// https://developer.okta.com/docs/reference/api/users/#profile-object
const userProfileSchema = z.object({
	email: z.string(),
	login: z.string(),
	isGuardianUser: z.boolean().nullable().optional(),
	registrationPlatform: z.string().nullable().optional(),
	emailValidated: z.boolean().nullable().optional(),
	lastEmailValidatedTimestamp: z.string().nullable().optional(),
	passwordSetSecurely: z.boolean().nullable().optional(),
	lastPasswordSetSecurelyTimestamp: z.string().nullable().optional(),
	registrationIdp: RegistrationIdp.nullable().optional(),
	registrationLocation: RegistrationLocationSchema.nullable().optional(),
	googleExternalId: z.string().nullable().optional(),
	appleExternalId: z.string().nullable().optional(),
	facebookExternalId: z.string().nullable().optional(),
	isJobsUser: z.boolean().nullable().optional(),
	firstName: z.string().nullable().optional(),
	lastName: z.string().nullable().optional(),
	legacyIdentityId: z.string().nullable().optional(),
});

// https://developer.okta.com/docs/reference/api/users/#password-object
// A password `value` is a write-only property. It is not returned in the response when reading.
// When a user has a valid password, or imported hashed password, or password hook,
// and a response object contains a password credential, then the Password object is a bare object
// without the value property defined(for example, `password: {}`), to indicate that a password value exists.
const userCredentialsPasswordSchema = z.object({
	value: z.string().nullable().optional(),
});

// https://developer.okta.com/docs/reference/api/users/#credentials-object
const userCredentialsSchema = z.object({
	password: userCredentialsPasswordSchema.nullable().optional(),
	recovery_question: z.unknown().nullable().optional(),
	provider: z.unknown().nullable().optional(),
});

// https://developer.okta.com/docs/reference/api/users/#user-object
export const userResponseSchema = z.object({
	id: z.string(),
	status: z.string(),
	profile: userProfileSchema.pick({
		email: true,
		login: true,
		isGuardianUser: true,
		emailValidated: true,
		firstName: true,
		lastName: true,
		isJobsUser: true,
		registrationLocation: true,
		registrationPlatform: true,
		legacyIdentityId: true,
	}),
	credentials: userCredentialsSchema,
});
export type UserResponse = z.infer<typeof userResponseSchema>;

// https://developer.okta.com/docs/reference/api/users/#activate-user
// https://developer.okta.com/docs/reference/api/users/#reactivate-user
export const activationTokenResponseSchema = z.object({
	activationUrl: z.string(),
	activationToken: z.string(),
});
export type ActivationTokenResponse = z.infer<
	typeof activationTokenResponseSchema
>;

// Our methods consume the activate_user, reactivate_user, and reset_password
// endpoints and return a token response.
const tokenResponseSchema = z.object({
	token: z.string(),
});
export type TokenResponse = z.infer<typeof tokenResponseSchema>;

// https://developer.okta.com/docs/reference/api/users/#request-parameters
const userCreationRequestSchema = z.object({
	profile: userProfileSchema.pick({
		email: true,
		login: true,
		isGuardianUser: true,
		registrationPlatform: true,
		registrationLocation: true,
	}),
	groupIds: z.array(z.string()),
});
export type UserCreationRequest = z.infer<typeof userCreationRequestSchema>;

// https://developer.okta.com/docs/reference/api/users/#request-parameters-6
const userUpdateRequestSchema = z.object({
	profile: userProfileSchema.partial().nullable().optional(),
	credentials: userCredentialsSchema.partial().nullable().optional(),
});
export type UserUpdateRequest = z.infer<typeof userUpdateRequestSchema>;

// https://developer.okta.com/docs/reference/api/users/#response-example-39
export const resetPasswordUrlResponseSchema = z.object({
	resetPasswordUrl: z.string(),
});
export type ResetPasswordUrlResponse = z.infer<
	typeof resetPasswordUrlResponseSchema
>;

// https://developer.okta.com/docs/reference/api/users/#user-status
export enum Status {
	STAGED = 'STAGED',
	ACTIVE = 'ACTIVE',
	PROVISIONED = 'PROVISIONED',
	RECOVERY = 'RECOVERY',
	PASSWORD_EXPIRED = 'PASSWORD_EXPIRED',
	PASSWORD_RESET = 'PASSWORD_RESET',
	SUSPENDED = 'SUSPENDED',
}

// https://developer.okta.com/docs/reference/api/sessions/#session-object
const sessionResponseSchema = z.object({
	id: z.string(),
	login: z.string(),
	userId: z.string(),
	expiresAt: z.string(),
	status: z.string(),
});
export type SessionResponse = z.infer<typeof sessionResponseSchema>;
