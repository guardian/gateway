import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { WelcomeSocial } from '@/client/pages/WelcomeSocial';

export const WelcomeSocialPage = () => {
	const clientState = useClientState();
	const { pageData = {}, queryParams, shortRequestId } = clientState;
	const { formError } = pageData;

	return (
		<WelcomeSocial
			formError={formError}
			queryParams={queryParams}
			geolocation={pageData.geolocation}
			appName={pageData.appName}
			shortRequestId={shortRequestId}
		/>
	);
};
