import React from 'react';
import { DeleteAccountComplete } from '@/client/pages/DeleteAccountComplete';
import useClientState from '@/client/lib/hooks/useClientState';

export const DeleteAccountCompletePage = () => {
	const clientState = useClientState();
	const { queryParams, shortRequestId } = clientState;
	const { returnUrl } = queryParams;

	return (
		<DeleteAccountComplete
			returnUrl={returnUrl}
			shortRequestId={shortRequestId}
		/>
	);
};
