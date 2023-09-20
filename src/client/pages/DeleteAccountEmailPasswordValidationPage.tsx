import React from 'react';
import {
	DeleteAccountEmailPasswordValidation,
	DeleteAccountEmailPasswordVerificationProps,
} from '@/client/pages/DeleteAccountEmailPasswordValidation';
import useClientState from '@/client/lib/hooks/useClientState';

export const DeleteAccountEmailPasswordValidationPage = ({
	validationType,
}: Omit<DeleteAccountEmailPasswordVerificationProps, 'queryParams'>) => {
	const clientState = useClientState();
	const { queryParams } = clientState;
	return (
		<DeleteAccountEmailPasswordValidation
			validationType={validationType}
			queryParams={queryParams}
		/>
	);
};
