import { OktaError } from '@/server/models/okta/Error';
import { SessionResponse, sessionSchema } from '@/server/models/okta/Session';
import { buildUrl } from '@/shared/lib/routeUtils';
import { joinUrl } from '@guardian/libs';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { handleErrorResponse } from './errors';
import { defaultHeaders } from './headers';

const { okta } = getConfiguration();

/**
 * Get a User session by session cookie
 *
 * For Identity Engine the cookie is called `idx`
 *
 * https://developer.okta.com/docs/api/openapi/okta-management/management/tag/Session/#tag/Session/operation/getCurrentSession
 *
 * The Okta API returns the users session details on success or
 * returns a 404 on error.
 *
 * We convert a successful API response to a Session response,
 * or throw an error on a failed response.
 *
 * @param idx Okta Identity Engine session cookie
 * @returns Promise<SessionResponse>
 */
export const getCurrentSession = async ({
	idx,
}: {
	idx?: string;
}): Promise<SessionResponse> => {
	const path = buildUrl('/api/v1/sessions/me');

	const Cookie = `${idx ? `idx=${idx};` : ''}`;

	const response = await fetch(joinUrl(okta.orgUrl, path), {
		headers: { ...defaultHeaders, Cookie },
		credentials: 'include',
	});

	if (response.ok) {
		try {
			return sessionSchema.parse(await response.json());
		} catch (error) {
			throw new OktaError({
				message: 'Could not parse Okta session response',
			});
		}
	} else {
		return await handleErrorResponse(response);
	}
};

/**
 * Close a User session by session cookie
 *
 * For Identity Engine the cookie is called `idx`
 *
 * https://developer.okta.com/docs/api/openapi/okta-management/management/tag/Session/#tag/Session/operation/closeCurrentSession
 *
 * The Okta API closes the users session on success or
 * returns a 404 on invalid.
 *
 * @param idx Okta Identity Engine session cookie
 * @returns Promise<void>
 */
export const closeCurrentSession = async ({
	idx,
}: {
	idx?: string;
}): Promise<undefined> => {
	const path = buildUrl('/api/v1/sessions/me');

	const Cookie = `${idx ? `idx=${idx};` : ''}`;

	const response = await fetch(joinUrl(okta.orgUrl, path), {
		method: 'DELETE',
		headers: { ...defaultHeaders, Cookie },
		credentials: 'include',
	});

	if (!(response.ok || response.status === 404)) {
		return handleErrorResponse(response);
	}
};
