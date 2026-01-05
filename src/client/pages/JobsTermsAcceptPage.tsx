import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { JobsTermsAccept } from '@/client/pages/JobsTermsAccept';
import { JOBS_TERMS_OF_SERVICE_URL } from '@/shared/model/Configuration';

export const JobsTermsPage = () => {
	const clientState = useClientState();
	const { pageData = {}, queryParams, shortRequestId } = clientState;
	const { firstName, secondName, email, formError, userBelongsToGRS } =
		pageData;

	return (
		<JobsTermsAccept
			formError={formError}
			submitUrl={buildUrlWithQueryParams(
				JOBS_TERMS_OF_SERVICE_URL,
				{},
				queryParams,
			)}
			firstName={firstName}
			secondName={secondName}
			userBelongsToGRS={userBelongsToGRS}
			email={email}
			shortRequestId={shortRequestId}
		/>
	);
};
