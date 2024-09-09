import { getConfiguration } from '@/server/lib/getConfiguration';

export const defaultHeaders = (ip?: string) => {
	const headers = {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	};

	if (ip) {
		return {
			...headers,
			'X-Forwarded-For': ip,
		};
	}

	return headers;
};

/**
 * AuthorizationHeader
 *
 * @returns Authorization header with API token
 */
export const authorizationHeader = () => {
	const { okta } = getConfiguration();
	return {
		Authorization: `SSWS ${okta.token}`,
	};
};
