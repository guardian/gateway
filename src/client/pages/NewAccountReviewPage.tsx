import React from 'react';
import { useAdFreeCookie } from '@/client/lib/hooks/useAdFreeCookie';
import useClientState from '@/client/lib/hooks/useClientState';
import { useCmpConsent } from '@/client/lib/hooks/useCmpConsent';
import { NewAccountReview } from '@/client/pages/NewAccountReview';
import { Consents } from '@/shared/model/Consent';

export const NewAccountReviewPage = () => {
	const clientState = useClientState();
	const { pageData: { consents = [] } = {}, queryParams } = clientState;

	// Note: profiling_optout is modelled as profiling_optin for Gateway
	const profiling = consents.find(
		(consent) => consent.id === Consents.PROFILING,
	);
	const advertising = consents.find(
		(consent) => consent.id === Consents.ADVERTISING,
	);
	const hasCmpConsent = useCmpConsent();
	const isDigitalSubscriber = useAdFreeCookie();
	const shouldPersonalisedAdvertisingPermissionRender =
		hasCmpConsent && !isDigitalSubscriber;

	return (
		<NewAccountReview
			profiling={profiling}
			advertising={
				shouldPersonalisedAdvertisingPermissionRender ? advertising : undefined
			}
			queryParams={queryParams}
		/>
	);
};
