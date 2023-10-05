import { z } from 'zod';
// Session object definition https://developer.okta.com/docs/reference/api/sessions/#session-properties
export const sessionSchema = z.object({
	id: z.string(),
	login: z.string(),
	userId: z.string(),
	expiresAt: z.string(),
	status: z.enum(['ACTIVE', 'MFA_REQUIRED', 'MFA_ENROLL']),
	lastPasswordVerification: z.string().nullable().optional(),
	lastFactorVerification: z.string().nullable().optional(),
	// amr: z.string(),
	// idp: z.string(),
});
export type SessionResponse = z.infer<typeof sessionSchema>;
