import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { GeoLocation } from '@/shared/model/Geolocation';
import { QueryParams } from '@/shared/model/QueryParams';
import { JOBS_TOS_URI } from '../model/Configuration';
import { AppName } from '@/shared/lib/appNameUtils';

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
	appName,
}: {
	geolocation?: GeoLocation;
	fromURI?: string;
	returnUrl: string;
	queryParams: QueryParams;
	appName?: AppName;
}): string => {
	// Jobs users need to accept additional Jobs terms and conditions
	// and submit their first and last name.
	if (queryParams.clientId === 'jobs') {
		return addQueryParamsToPath(JOBS_TOS_URI, queryParams);
	}

	if (fromURI && appName !== 'Guardian') {
		return fromURI;
	}

	return geolocation
		? addQueryParamsToPath('/welcome/newsletters', queryParams)
		: returnUrl;
};
