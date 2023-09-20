import React from 'react';
import { DeleteAccount } from '@/client/pages/DeleteAccount';
import useClientState from '@/client/lib/hooks/useClientState';

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
