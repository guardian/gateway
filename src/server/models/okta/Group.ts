import { z } from 'zod';

// https://developer.okta.com/docs/reference/api/groups/#group-attributes
export const groupSchema = z.object({
	id: z.string(),
	profile: z.object({
		name: z.string(),
		description: z.string().nullable().optional(),
	}),
});
export type Group = z.infer<typeof groupSchema>;
