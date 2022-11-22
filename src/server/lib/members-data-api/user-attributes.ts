import { buildUrl } from '@/shared/lib/routeUtils';
import { joinUrl } from '@guardian/libs';
import { z } from 'zod';
import { getConfiguration } from '../getConfiguration';
import { logger } from '../serverSideLogger';

/**
 * Members Data API
 * https://members-data-api.theguardian.com
 *
 * https://github.com/guardian/members-data-api
 */

const { membersDataApiUrl } = getConfiguration();

/**
 * This type is manually kept in sync with the Membership API:
 * https://github.com/guardian/members-data-api/blob/main/membership-attribute-service/app/models/Attributes.scala
 */
const userAttributesResponseSchema = z
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

    contentAccess: z.object({
      member: z.boolean(),
      paidMember: z.boolean(),
      recurringContributor: z.boolean(),
      supporterPlus: z.boolean(),
      digitalPack: z.boolean(),
      paperSubscriber: z.boolean(),
      guardianWeeklySubscriber: z.boolean(),
      guardianPatron: z.boolean(),
    }),
  })
  .strict();
export type UserAttributesResponse = z.infer<
  typeof userAttributesResponseSchema
>;

/**
 * @name getUserAttributes
 * @description Call members-data-api to get user product information using an SC_GU_U cookie
 *
 * @param sc_gu_u SC_GU_U cookie
 * @param request_id optional request id for logging
 * @returns UserAttributesResponse | undefined
 */
export const getUserAttributes = async (
  sc_gu_u: string,
  request_id?: string,
): Promise<UserAttributesResponse | undefined> => {
  try {
    const path = buildUrl('/user-attributes/me');

    const response = await fetch(joinUrl(membersDataApiUrl, path), {
      method: 'GET',
      headers: {
        cookie: `SC_GU_U=${sc_gu_u}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `MDAPI returned ${response.status} ${response.statusText}`,
      );
    }

    return userAttributesResponseSchema.parse(await response.json());
  } catch (error) {
    logger.error(`MDAPI Error getUserAttributes '/user-attributes/me'`, error, {
      request_id,
    });
  }
};
