import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ReturnToApp } from '@/client/pages/ReturnToApp';

export const ReturnToAppPage = () => {
	const clientState = useClientState();
	const { pageData = {}, shortRequestId } = clientState;
	const { email, appName } = pageData;

	return (
		<ReturnToApp
			email={email}
			appName={appName}
			shortRequestId={shortRequestId}
		/>
	);
};
