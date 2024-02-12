import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { PasswordlessRegistrationComplete } from '@/client/pages/PasswordlessRegistrationComplete';

export const PasswordlessRegistrationCompletePage = () => {
	const clientState = useClientState();
	const { queryParams } = clientState;

	return <PasswordlessRegistrationComplete queryParams={queryParams} />;
};
