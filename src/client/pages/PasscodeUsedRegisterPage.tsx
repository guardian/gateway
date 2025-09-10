import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { PasscodeUsed } from '@/client/pages/PasscodeUsed';

export const PasscodeUsedRegisterPage = () => {
	const clientState = useClientState();
	const { queryParams, shortRequestId } = clientState;

	return (
		<PasscodeUsed
			path="/welcome"
			queryParams={queryParams}
			shortRequestId={shortRequestId}
		/>
	);
};
