import { z } from 'zod';

// list of benefits we're looking for
const BenefitEnum = z.enum([
	'adFree',
	'allowRejectAll',
	'hideSupportMessaging',
]);

export const userBenefitsResponseSchema = z.object({
	benefits: z
		.array(z.string()) // Accept any array of strings
		.transform((values) =>
			values.filter((val) => BenefitEnum.safeParse(val).success),
		), // Filter out unknown values based on the BenefitEnum
});

export const userBenefitsSchema = z.object({
	adFree: z.boolean().optional(),
	allowRejectAll: z.boolean().optional(),
	hideSupportMessaging: z.boolean().optional(),
});

export type UserBenefitsSchema = z.infer<typeof userBenefitsSchema>;

export type UserBenefitsResponse = z.infer<typeof userBenefitsResponseSchema>;
