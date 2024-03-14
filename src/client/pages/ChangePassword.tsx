import React from 'react';
import { PasswordForm } from '@/client/components/PasswordForm';
import { FieldError } from '@/shared/model/ClientState';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MinimalLayout } from '../layouts/MinimalLayout';

type Props = {
	headerText: string;
	buttonText: string;
	submitUrl: string;
	email: string;
	fieldErrors: FieldError[];
	formError?: string;
	browserName?: string;
};

export const ChangePassword = ({
	headerText,
	buttonText,
	submitUrl,
	email,
	fieldErrors,
	formError,
	browserName,
}: Props) => (
	<MinimalLayout pageHeader={headerText}>
		<MainBodyText>
			You’ve requested to create a new password for <strong>{email}</strong>
		</MainBodyText>
		<PasswordForm
			submitUrl={submitUrl}
			submitButtonText={buttonText}
			fieldErrors={fieldErrors}
			labelText="Password"
			autoComplete="new-password"
			formTrackingName="new-password"
			formError={formError}
			browserName={browserName}
			largeFormMarginTop
		/>
	</MinimalLayout>
);
