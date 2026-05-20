import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { GeoLocation } from '@/shared/model/Geolocation';
import { QueryParams } from '@/shared/model/QueryParams';
import { JOBS_TOS_URI } from '../model/Configuration';

/**
 * Returns the next page in the welcome flow based on the user's geolocation
 * and fromURI.
 * If the function returns null, the user should be redirected to the
 * previously set returnUrl.
 */
export const getNextWelcomeFlowPage = ({
	geolocation,
	returnUrl,
	queryParams,
}: {
	geolocation?: GeoLocation;
	returnUrl: string;
	queryParams: QueryParams;
}): string => {
	// Jobs users need to accept additional Jobs terms and conditions
	// and submit their first and last name.
	if (queryParams.clientId === 'jobs') {
		return addQueryParamsToPath(JOBS_TOS_URI, queryParams);
	}

	return geolocation
		? addQueryParamsToPath('/welcome/newsletters', queryParams)
		: returnUrl;
};
