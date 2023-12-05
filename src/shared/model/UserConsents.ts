import { z } from 'zod';

export const userConsentSchema = z.object({
	id: z.string(),
	consented: z.boolean().optional(),
});

export type UserConsent = z.infer<typeof userConsentSchema>;
