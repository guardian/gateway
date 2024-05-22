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
	// if there is a fromURI, we need to complete the oauth flow by redirecting to it
	// fromURIs are only set in apps.
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
