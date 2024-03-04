import { z } from 'zod';

/**
 * This type is manually kept in sync with the Membership API:
 * https://github.com/guardian/members-data-api/blob/main/membership-attribute-service/app/models/Attributes.scala
 */
export const userAttributesResponseSchema = z
	.object({
		userId: z.string(),

		tier: z.string().optional(),
		recurringContributionPaymentPlan: z.string().optional(),
		oneOffContributionDate: z.string().optional(),
		membershipJoinDate: z.string().optional(),
		digitalSubscriptionExpiryDate: z.string().optional(),
		paperSubscriptionExpiryDate: z.string().optional(),
		guardianWeeklyExpiryDate: z.string().optional(),
		liveAppSubscriptionExpiryDate: z.string().optional(),
		guardianPatronExpiryDate: z.string().optional(),
		alertAvailableFor: z.string().optional(),

		showSupportMessaging: z.boolean(),
		feastIosSubscriptionGroup: z.string().optional(),

		contentAccess: z.object({
			member: z.boolean(),
			paidMember: z.boolean(),
			recurringContributor: z.boolean(),
			supporterPlus: z.boolean(),
			digitalPack: z.boolean(),
			paperSubscriber: z.boolean(),
			guardianWeeklySubscriber: z.boolean(),
			guardianPatron: z.boolean(),
			feast: z.boolean().optional(),
		}),
	})
	.strict();
export type UserAttributesResponse = z.infer<
	typeof userAttributesResponseSchema
>;
