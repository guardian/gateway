import React from 'react';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { primaryButtonStyles } from '@/client/styles/Shared';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';

type ChangeEmailErrorProps = {
	accountManagementUrl?: string;
};

export const ChangeEmailError = ({
	accountManagementUrl = 'https://manage.theguardian.com',
}: ChangeEmailErrorProps) => {
	return (
		<MinimalLayout
			pageHeader="Email change failed"
			leadText="
				The email change link you followed has expired or was invalid. Please
				return to your account details to try again.
			"
		>
			<ExternalLinkButton
				css={primaryButtonStyles()}
				href={`${accountManagementUrl}/account-settings`}
			>
				Back to account details
			</ExternalLinkButton>
		</MinimalLayout>
	);
};
