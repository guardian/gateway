import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { DeleteAccount } from '@/client/pages/DeleteAccount';

export const DeleteAccountPage = () => {
	const clientState = useClientState();
	const {
		queryParams,
		pageData: { formError, fieldErrors } = {},
		globalMessage: { error } = {},
	} = clientState;

	return (
		<DeleteAccount
			queryParams={queryParams}
			formError={formError}
			fieldErrors={fieldErrors}
			error={error}
		/>
	);
};
