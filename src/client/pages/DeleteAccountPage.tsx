import React from 'react';
import { DeleteAccount } from '@/client/pages/DeleteAccount';
import useClientState from '@/client/lib/hooks/useClientState';

export const DeleteAccountPage = () => {
	const clientState = useClientState();
	const { queryParams } = clientState;

	return <DeleteAccount queryParams={queryParams} />;
};
