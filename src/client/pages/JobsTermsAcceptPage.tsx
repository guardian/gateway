import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { JobsTermsAccept } from '@/client/pages/JobsTermsAccept';
import { JOBS_TOS_URI } from '@/shared/model/Configuration';

export const JobsTermsPage = () => {
	const clientState = useClientState();
	const { pageData = {}, queryParams, shortRequestId } = clientState;
	const { firstName, secondName, email, formError, userBelongsToGRS } =
		pageData;

	return (
		<JobsTermsAccept
			formError={formError}
			submitUrl={buildUrlWithQueryParams(JOBS_TOS_URI, {}, queryParams)}
			firstName={firstName}
			secondName={secondName}
			userBelongsToGRS={userBelongsToGRS}
			email={email}
			shortRequestId={shortRequestId}
		/>
	);
};
