import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { NewAccountReview } from '@/client/pages/NewAccountReview';
import { getNextWelcomeFlowPage } from '@/shared/lib/welcome';

export const NewAccountReviewPage = () => {
	const clientState = useClientState();
	const { pageData = {}, queryParams, shortRequestId } = clientState;
	const { appName } = pageData;

	const nextPage = getNextWelcomeFlowPage({
		geolocation: pageData.geolocation,
		fromURI: queryParams.fromURI,
		returnUrl: queryParams.returnUrl,
		queryParams,
		appName,
	});

	return (
		<NewAccountReview shortRequestId={shortRequestId} nextPage={nextPage} />
	);
};
