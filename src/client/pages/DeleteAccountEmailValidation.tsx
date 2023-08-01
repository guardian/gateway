import React from 'react';
import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MainForm } from '@/client/components/MainForm';
import { DeleteAccountReturnLink } from '@/client/components/DeleteAccountReturnLink';

export const DeleteAccountEmailValidation = () => {
	return (
		<MainLayout pageHeader="Delete your Guardian account">
			<MainForm formAction="" submitButtonText="Send validation email">
				<MainBodyText noMarginBottom>
					Before you can delete your account you need to validate your email
					address. Once you have validated, please reload this page and you will
					be able to delete your account.
				</MainBodyText>
			</MainForm>
			<DeleteAccountReturnLink />
		</MainLayout>
	);
};
