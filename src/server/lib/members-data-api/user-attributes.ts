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
 * @description Call members-data-api to get user product information using an SC_GU_U cookie
 *
 * @param sc_gu_u SC_GU_U cookie
 * @param request_id optional request id for logging
 * @returns UserAttributesResponse | undefined
 */
export const getUserAttributes = async ({
	sc_gu_u,
	accessToken,
	request_id,
}: {
	sc_gu_u?: string;
	accessToken?: string;
	request_id?: string;
}): Promise<UserAttributesResponse | undefined> => {
	try {
		const path = buildUrl('/user-attributes/me');

		// choose the correct auth header, Authorization if using OAuth, Cookie if using SC_GU_U
		const headers: Headers = (() => {
			const headers = new Headers();

			if (accessToken) {
				headers.append('Authorization', `Bearer ${accessToken}`);
				return headers;
			}
			if (sc_gu_u) {
				headers.append('Cookie', `SC_GU_U=${sc_gu_u}`);
				return headers;
			}

			return headers;
		})();

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
