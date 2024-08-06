import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { DeleteAccountComplete } from '@/client/pages/DeleteAccountComplete';

export const DeleteAccountCompletePage = () => {
	const clientState = useClientState();
	const { queryParams } = clientState;
	const { returnUrl } = queryParams;

	return <DeleteAccountComplete returnUrl={returnUrl} />;
};
