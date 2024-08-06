import React from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { PasswordForm } from '@/client/components/PasswordForm';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import type { FieldError } from '@/shared/model/ClientState';

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
	<MinimalLayout
		pageHeader={headerText}
		leadText={
			<MainBodyText>
				You’ve requested to create a new password for <strong>{email}</strong>
			</MainBodyText>
		}
	>
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
