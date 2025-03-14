import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { Consents } from '@/shared/model/Consent';

import { useAdFreeCookie } from '@/client/lib/hooks/useAdFreeCookie';
import { NewAccountReview } from '@/client/pages/NewAccountReview';

export const NewAccountReviewPage = () => {
	const clientState = useClientState();
	const {
		pageData: { consents = [] } = {},
		queryParams,
		shortRequestId,
	} = clientState;

	// Note: profiling_optout is modelled as profiling_optin for Gateway
	const profiling = consents.find(
		(consent) => consent.id === Consents.PROFILING,
	);
	const advertising = consents.find(
		(consent) => consent.id === Consents.ADVERTISING,
	);

	const isDigitalSubscriber = useAdFreeCookie();

	return (
		<NewAccountReview
			shortRequestId={shortRequestId}
			profiling={profiling}
			advertising={isDigitalSubscriber ? undefined : advertising}
			queryParams={queryParams}
		/>
	);
};
