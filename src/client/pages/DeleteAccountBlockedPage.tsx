import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { DeleteAccountBlocked } from '@/client/pages/DeleteAccountBlocked';

export const DeleteAccountBlockedPage = () => {
	const clientState = useClientState();
	const { pageData = {} } = clientState;
	const { contentAccess } = pageData;

	return <DeleteAccountBlocked contentAccess={contentAccess} />;
};
