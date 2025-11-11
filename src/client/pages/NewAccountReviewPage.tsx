import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { NewAccountReview } from '@/client/pages/NewAccountReview';

export const NewAccountReviewPage = () => {
	const clientState = useClientState();
	const { queryParams, shortRequestId } = clientState;

	return (
		<NewAccountReview
			shortRequestId={shortRequestId}
			queryParams={queryParams}
		/>
	);
};
