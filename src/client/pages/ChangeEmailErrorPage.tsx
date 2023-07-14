import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ChangeEmailError } from '@/client/pages/ChangeEmailError';

export const ChangeEmailErrorPage = () => {
	const clientState = useClientState();
	const { pageData = {} } = clientState;
	const { accountManagementUrl } = pageData;
	return <ChangeEmailError accountManagementUrl={accountManagementUrl} />;
};
