import React from 'react';
import {
	DeleteAccountEmailPasswordValidation,
	DeleteAccountEmailPasswordVerificationProps,
} from '@/client/pages/DeleteAccountEmailPasswordValidation';

export const DeleteAccountEmailPasswordValidationPage = ({
	validationType,
}: DeleteAccountEmailPasswordVerificationProps) => {
	return (
		<DeleteAccountEmailPasswordValidation validationType={validationType} />
	);
};
