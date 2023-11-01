import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { SignedInAs } from '@/client/pages/SignedInAs';

export const SignedInAsPage = () => {
	const clientState = useClientState();
	const { pageData = {}, globalMessage = {}, queryParams } = clientState;
	const {
		email = '',
		continueLink = '',
		signOutLink = '',
		isNativeApp,
	} = pageData;
	const { error: pageError } = globalMessage;

	return (
		<SignedInAs
			email={email}
			continueLink={continueLink}
			signOutLink={signOutLink}
			isNativeApp={isNativeApp}
			pageError={pageError}
			queryParams={queryParams}
		/>
	);
};
