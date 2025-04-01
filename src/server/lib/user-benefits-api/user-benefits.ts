import { getConfiguration } from '@/server/lib/getConfiguration';
// import { buildUrl } from '@/shared/lib/routeUtils';
import {
	UserBenefitsResponse,
	userBenefitsResponseSchema,
} from '@/shared/lib/user-benefits-api';
import { logger } from '../serverSideLogger';
import { joinUrl } from '@guardian/libs';

const { userBenefitsApiUrl } = getConfiguration();

export const getUserBenefits = async ({
	accessToken,
}: {
	accessToken: string;
}): Promise<UserBenefitsResponse | undefined> => {
	try {
		const path = '/benefits/me';
		// const path = `https://user-benefits.guardianapis.com/benefits/me`;

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
