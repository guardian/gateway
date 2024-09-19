import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { NewAccountNewsletters } from '@/client/pages/NewAccountNewsletters';

export const NewAccountNewslettersPage = () => {
	const clientState = useClientState();
	const {
		pageData: { newsletters = [], accountManagementUrl } = {},
		queryParams,
		shortRequestId,
	} = clientState;

	return (
		<NewAccountNewsletters
			newsletters={newsletters}
			queryParams={queryParams}
			accountManagementUrl={accountManagementUrl}
			shortRequestId={shortRequestId}
		/>
	);
};
