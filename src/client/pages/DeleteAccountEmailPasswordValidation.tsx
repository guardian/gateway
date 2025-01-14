import React from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MainForm } from '@/client/components/MainForm';
import { DeleteAccountReturnLink } from '@/client/components/DeleteAccountReturnLink';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { QueryParams } from '@/shared/model/QueryParams';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';

export type DeleteAccountEmailPasswordVerificationProps = {
	validationType: 'email' | 'password';
	queryParams: QueryParams;
	shortRequestId?: string;
};

export const DeleteAccountEmailPasswordValidation = ({
	validationType,
	queryParams,
	shortRequestId,
}: DeleteAccountEmailPasswordVerificationProps) => {
	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader="Delete your Guardian account"
			errorOverride={queryParams.error_description}
		>
			{validationType === 'email' && (
				<MainForm
					shortRequestId={shortRequestId}
					formAction={buildUrlWithQueryParams(
						'/delete-email-validation',
						{},
						queryParams,
					)}
					submitButtonText="Send validation email"
					disableOnSubmit
				>
					<MainBodyText>
						Before you can delete your account you need to validate your email
						address. Once you have validated, please reload this page and you
						will be able to delete your account.
					</MainBodyText>
				</MainForm>
			)}
			{validationType === 'password' && (
				<MainForm
					shortRequestId={shortRequestId}
					formAction={buildUrlWithQueryParams(
						'/delete-email-validation',
						{},
						queryParams,
					)}
					submitButtonText="Set password"
					disableOnSubmit
				>
					<MainBodyText>
						Before you can delete your account you need to set a password for
						your account. Once you have done so, please reload this page and you
						will be able to delete your account.
					</MainBodyText>
				</MainForm>
			)}
			<DeleteAccountReturnLink />
		</MinimalLayout>
	);
};
