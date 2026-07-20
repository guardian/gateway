import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { NewAccountConsents } from './NewAccountConsents';

export const NewAccountConsentsPage = () => {
	const clientState = useClientState();
	const {
		pageData = {},
		queryParams,
		shortRequestId,
		globalMessage = {},
	} = clientState;
	const { email, formError, signInOrRegister } = pageData;
	const { error: pageError } = globalMessage;

	return (
		<NewAccountConsents
			formError={formError}
			email={email}
			queryParams={queryParams}
			geolocation={pageData.geolocation}
			appName={pageData.appName}
			shortRequestId={shortRequestId}
			pageError={pageError}
			signInOrRegister={signInOrRegister}
		/>
	);
};
