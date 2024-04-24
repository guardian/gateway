import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { JobsTermsAccept } from '@/client/pages/JobsTermsAccept';

export const JobsTermsPage = () => {
	const clientState = useClientState();
	const { pageData = {}, queryParams } = clientState;
	const { firstName, secondName, email, formError, userBelongsToGRS } =
		pageData;

	return (
		<JobsTermsAccept
			formError={formError}
			submitUrl={buildUrlWithQueryParams('/agree/GRS', {}, queryParams)}
			firstName={firstName}
			secondName={secondName}
			userBelongsToGRS={userBelongsToGRS}
			email={email}
		/>
	);
};
