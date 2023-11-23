import { z } from 'zod';

export const newsletterPatchSchema = z.object({
	id: z.string(),
	subscribed: z.boolean(),
});
export type NewsletterPatch = z.infer<typeof newsletterPatchSchema>;
