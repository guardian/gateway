import { z } from 'zod';

// export const userBenefitsResponseSchema = z.object({
// 	benefits: z
// 		.array(z.enum(['adFree', 'allowRejectAll', 'hideSupportMessaging']))
// 		.optional(),
// });

export const userBenefitsResponseSchema = z.object({
	benefits: z.array(z.string()).optional(),
});

export const userBenefitsSchema = z.object({
	adFree: z.boolean().optional(),
	allowRejectAll: z.boolean().optional(),
	hideSupportMessaging: z.boolean().optional(),
});

export type UserBenefitsSchema = z.infer<typeof userBenefitsSchema>;

export type UserBenefitsResponse = z.infer<typeof userBenefitsResponseSchema>;
