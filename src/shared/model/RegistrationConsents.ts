import { z } from 'zod';
import { newsletterPatchSchema } from './NewsletterPatch';
import { userConsentSchema } from './UserConsents';

export const registrationConsentsSchema = z
	.object({
		consents: userConsentSchema.array().optional(),
		newsletters: newsletterPatchSchema.array().optional(),
	})
	.strict();

export type RegistrationConsents = z.infer<typeof registrationConsentsSchema>;
