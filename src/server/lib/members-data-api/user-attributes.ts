import { buildUrl } from '@/shared/lib/routeUtils';
import { joinUrl } from '@guardian/libs';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from '@/server/lib/serverSideLogger';
import {
	UserAttributesResponse,
	userAttributesResponseSchema,
} from '@/shared/lib/members-data-api';

/**
 * Members Data API
 * https://members-data-api.theguardian.com
 *
 * https://github.com/guardian/members-data-api
 */

const { membersDataApiUrl } = getConfiguration();

/**
 * @name getUserAttributes
 * @description Call members-data-api to get user product information
 *
 * @param request_id optional request id for logging
 * @returns UserAttributesResponse | undefined
 */
export const getUserAttributes = async ({
	accessToken,
	request_id,
}: {
	accessToken: string;
	request_id?: string;
}): Promise<UserAttributesResponse | undefined> => {
	try {
		const path = buildUrl('/user-attributes/me');

		const headers = new Headers();
		headers.append('Authorization', `Bearer ${accessToken}`);

		const response = await fetch(joinUrl(membersDataApiUrl, path), {
			method: 'GET',
			headers,
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
