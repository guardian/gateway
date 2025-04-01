import { getConfiguration } from '@/server/lib/getConfiguration';
import {
	UserBenefitsResponse,
	userBenefitsResponseSchema,
	UserBenefitsSchema,
} from '@/shared/lib/user-benefits-api';
import { logger } from '../serverSideLogger';
import { joinUrl } from '@guardian/libs';

const { userBenefitsApiUrl } = getConfiguration();

export const getUserBenefits = async ({
	accessToken,
}: {
	accessToken: string;
}): Promise<UserBenefitsSchema | undefined> => {
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

		return translateDataFromUserBenefitsApi(
			userBenefitsResponseSchema.parse(await response.json()),
		);
	} catch (error) {
		logger.error(`UserBenefitsAPI Error getUserBenefits '/benefits/me'`, error);
	}
};

export const translateDataFromUserBenefitsApi = (
	userBenefitsResponse: UserBenefitsResponse,
): UserBenefitsSchema => {
	return {
		hideSupportMessaging: userBenefitsResponse?.benefits?.includes(
			'hideSupportMessaging',
		),
		adFree: userBenefitsResponse?.benefits?.includes('adFree'),
		allowRejectAll: userBenefitsResponse?.benefits?.includes('allowRejectAll'),
	};
};
