import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';

import { WelcomeExisting } from '@/client/pages/WelcomeExisting';

export const WelcomeExistingPage = () => {
	const clientState = useClientState();
	const { pageData: { accountManagementUrl, email } = {}, queryParams } =
		clientState;

	return (
		<WelcomeExisting
			queryParams={queryParams}
			accountManagementUrl={accountManagementUrl}
			email={email}
		/>
	);
};
