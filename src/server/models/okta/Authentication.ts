import { z } from 'zod';

// https://github.com/badgateway/hal-types/blob/main/src/hal.ts#L7
const halLinkSchema = z.object({
	href: z.string(),
	type: z.string().nullable().optional(),
	templated: z.boolean().nullable().optional(),
	title: z.string().nullable().optional(),
	hreflang: z.string().nullable().optional(),
	profile: z.string().nullable().optional(),
	name: z.string().nullable().optional(),
	deprecation: z.string().nullable().optional(),
	hints: z.object({}).nullable().optional(),
});

/**
 * Okta's Authentication API models, see - https://developer.okta.com/docs/reference/api/authn/
 */

// https://developer.okta.com/docs/reference/api/authn/#transaction-state
const AuthenticationTransactionState = {
	LOCKED_OUT: 'LOCKED_OUT',
	MFA_CHALLENGE: 'MFA_CHALLENGE',
	MFA_ENROLL_ACTIVATE: 'MFA_ENROLL_ACTIVATE',
	MFA_ENROLL: 'MFA_ENROLL',
	MFA_REQUIRED: 'MFA_REQUIRED',
	PASSWORD_EXPIRED: 'PASSWORD_EXPIRED',
	PASSWORD_RESET: 'PASSWORD_RESET',
	PASSWORD_WARN: 'PASSWORD_WARN',
	RECOVERY_CHALLENGE: 'RECOVERY_CHALLENGE',
	RECOVERY: 'RECOVERY',
	SUCCESS: 'SUCCESS',
	UNAUTHENTICATED: 'UNAUTHENTICATED',
} as const;

// https://developer.okta.com/docs/reference/api/authn/#factor-result
const AuthenticationFactorResult = {
	CANCELLED: 'CANCELLED',
	ERROR: 'ERROR',
	PASSCODE_REPLAYED: 'PASSCODE_REPLAYED',
	TIMEOUT: 'TIMEOUT',
	TIME_WINDOW_EXCEEDED: 'TIME_WINDOW_EXCEEDED',
	WAITING: 'WAITING',
} as const;

// https://developer.okta.com/docs/reference/api/authn/#links-object
const authenticationLinksSchema = z.object({
	next: halLinkSchema.nullable().optional(),
	prev: halLinkSchema.nullable().optional(),
	cancel: halLinkSchema.nullable().optional(),
	skip: halLinkSchema.nullable().optional(),
	resend: halLinkSchema.nullable().optional(),
});

// https://developer.okta.com/docs/reference/api/authn/#user-profile-object
const authenticationEmbeddedUserProfileSchema = z.object({
	login: z.string(),
	// okta says this is not nullable or optional, but there are some
	// users in our system that do not have a firstName/lastName or it is null
	firstName: z.string().nullable().optional(),
	lastName: z.string().nullable().optional(),
	locale: z.string().nullable().optional(),
	timeZone: z.string().nullable().optional(),
});

// https://developer.okta.com/docs/reference/api/authn/#recovery-question-object
const authenticationEmbeddedRecoveryQuestionSchema = z.object({
	question: z.string(),
});

// https://developer.okta.com/docs/reference/api/authn/#user-object
const authenticationEmbeddedUserSchema = z.object({
	id: z.string(),
	passwordChanged: z.string().nullable().optional(),
	profile: authenticationEmbeddedUserProfileSchema,
	recovery_question: authenticationEmbeddedRecoveryQuestionSchema
		.nullable()
		.optional(),
});

// https://developer.okta.com/docs/reference/api/authn/#authentication-transaction-object
export const authenticationTransactionSchema = z.object({
	_embedded: z
		.object({
			user: authenticationEmbeddedUserSchema,
		})
		.nullable()
		.optional(),
	_links: authenticationLinksSchema.nullable().optional(),
	expiresAt: z.string().nullable().optional(),
	factorResult: z.nativeEnum(AuthenticationFactorResult).nullable().optional(),
	sessionToken: z.string().nullable().optional(),
	stateToken: z.string().nullable().optional(),
	status: z.nativeEnum(AuthenticationTransactionState).nullable().optional(),
});
export type AuthenticationTransaction = z.infer<
	typeof authenticationTransactionSchema
>;

// https://developer.okta.com/docs/reference/api/authn/#request-parameters-for-primary-authentication
const authenticationRequestParametersSchema = z.object({
	audience: z.string().nullable().optional(),
	context: z
		.object({
			deviceToken: z.string().nullable().optional(),
		})
		.nullable()
		.optional(),
	options: z
		.object({
			multiOptionalFactorEnroll: z.boolean().nullable().optional(),
			warnBeforePasswordExpired: z.boolean().nullable().optional(),
		})
		.nullable()
		.optional(),
	password: z.string().nullable().optional(),
	token: z.string().nullable().optional(),
	username: z.string().nullable().optional(),
});
export type AuthenticationRequestParameters = z.infer<
	typeof authenticationRequestParametersSchema
>;
