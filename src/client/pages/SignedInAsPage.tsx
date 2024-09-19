import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { SignedInAs } from '@/client/pages/SignedInAs';

export const SignedInAsPage = () => {
	const clientState = useClientState();
	const {
		pageData = {},
		globalMessage = {},
		queryParams,
		shortRequestId,
	} = clientState;
	const { email = '', continueLink = '', signOutLink = '', appName } = pageData;
	const { error: pageError } = globalMessage;

	return (
		<SignedInAs
			email={email}
			continueLink={continueLink}
			signOutLink={signOutLink}
			appName={appName}
			pageError={pageError}
			queryParams={queryParams}
			shortRequestId={shortRequestId}
		/>
	);
};
