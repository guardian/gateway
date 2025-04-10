import { getConfiguration } from '@/server/lib/getConfiguration';
import {
	UserBenefitsResponse,
	userBenefitsResponseSchema,
} from '@/shared/lib/user-benefits-api';
import { logger } from '../serverSideLogger';
import { joinUrl } from '@guardian/libs';

const { userBenefitsApiUrl } = getConfiguration();

/**
 * User benefits api
 * https://github.com/guardian/support-service-lambdas/tree/main/handlers/user-benefits
 *
 * @param {{
 * 	accessToken: string;
 * }} {
 * 	accessToken,
 * }
 * @return {*}  {(Promise<UserBenefitsResponse | undefined>)}
 */
export const getUserBenefits = async ({
	accessToken,
}: {
	accessToken: string;
}): Promise<UserBenefitsResponse | undefined> => {
	try {
		const path = '/benefits/me';

		const headers = new Headers();
		headers.append('Authorization', `Bearer ${accessToken}`);

		const response = await fetch(joinUrl(userBenefitsApiUrl, path), {
			method: 'GET',
			headers,
		});

		if (!response.ok) {
			throw new Error(
				`UserBenefitsAPI returned ${response.status} ${response.statusText}`,
			);
		}

		return userBenefitsResponseSchema.parse(await response.json());
	} catch (error) {
		logger.error(`UserBenefitsAPI Error getUserBenefits '/benefits/me'`, error);
	}
};
