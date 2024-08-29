import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ResendConsentEmail } from '@/client/pages/ResendConsentEmail';

export const ResendConsentEmailPage = () => {
	const clientState = useClientState();
	const {
		pageData: { token = '' } = {},
		queryParams,
		shortRequestId,
	} = clientState;

	return (
		<ResendConsentEmail
			token={token}
			queryParams={queryParams}
			shortRequestId={shortRequestId}
		/>
	);
};
