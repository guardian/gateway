import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { NewAccountNewsletters } from './NewAccountNewsletters';

export const NewAccountNewslettersPage = () => {
	const clientState = useClientState();
	const {
		pageData: { newsletters = [], accountManagementUrl } = {},
		queryParams,
	} = clientState;

	return (
		<NewAccountNewsletters
			newsletters={newsletters}
			queryParams={queryParams}
			accountManagementUrl={accountManagementUrl}
		/>
	);
};
