import { z } from 'zod';

export const userBenefitsResponseSchema = z.object({
	benefits: z.array(z.string()),
	trials: z.object({}).optional(),
});

export type UserBenefitsResponse = z.infer<typeof userBenefitsResponseSchema>;
