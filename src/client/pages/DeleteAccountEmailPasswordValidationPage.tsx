import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import type { DeleteAccountEmailPasswordVerificationProps } from '@/client/pages/DeleteAccountEmailPasswordValidation';
import { DeleteAccountEmailPasswordValidation } from '@/client/pages/DeleteAccountEmailPasswordValidation';

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
