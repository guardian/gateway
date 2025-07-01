import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { GeoLocation } from '@/shared/model/Geolocation';
import { QueryParams } from '@/shared/model/QueryParams';

/**
 * Returns the next page in the welcome flow based on the user's geolocation
 * and fromURI.
 * If the function returns null, the user should be redirected to the
 * previously set returnUrl.
 */
export const getNextWelcomeFlowPage = ({
	geolocation,
	fromURI,
	returnUrl,
	queryParams,
}: {
	geolocation?: GeoLocation;
	fromURI?: string;
	returnUrl: string;
	queryParams: QueryParams;
}): string => {
	// Jobs users need to accept additional Jobs terms and conditions
	// and submit their first and last name.
	if (queryParams.clientId === 'jobs') {
		return addQueryParamsToPath('/agree/GRS', queryParams);
	}

	// if there is a fromURI, we need to complete the oauth flow by redirecting to it
	if (fromURI) {
		return fromURI;
	}

	// Otherwise (web), we select based on geolocation.
	switch (geolocation) {
		case 'US':
		case 'AU':
			return addQueryParamsToPath('/welcome/newsletters', queryParams);
		default:
			return returnUrl;
	}
};
