import { z } from 'zod';

// list of product benefits
// https://github.com/guardian/support-service-lambdas/blob/main/modules/product-benefits/src/schemas.ts
const BenefitEnum = z.enum([
	'adFree',
	'allowRejectAll',
	'hideSupportMessaging',
]);

export const userBenefitsResponseSchema = z.object({
	benefits: z
		.array(z.string()) // Accept any array of strings
		.transform((values) =>
			values.filter(
				(val): val is z.infer<typeof BenefitEnum> =>
					BenefitEnum.safeParse(val).success,
			),
		), // Filter out unknown values based on the BenefitEnum
});

export type UserBenefitsResponse = z.infer<typeof userBenefitsResponseSchema>;
