import React from 'react';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import {
	primaryButtonStyles,
	secondaryButtonStyles,
} from '@/client/styles/Shared';

type ChangeEmailCompleteProps = {
	returnUrl?: string;
	accountManagementUrl?: string;
};

export const ChangeEmailComplete = ({
	returnUrl = 'https://www.theguardian.com',
	accountManagementUrl = 'https://manage.theguardian.com',
}: ChangeEmailCompleteProps) => {
	return (
		<MinimalLayout
			pageHeader="Email changed"
			leadText="Success! Your email address has been updated."
		>
			<ExternalLinkButton
				css={primaryButtonStyles()}
				href={`${accountManagementUrl}/account-settings`}
			>
				Back to account details
			</ExternalLinkButton>
			<ExternalLinkButton
				priority="tertiary"
				css={secondaryButtonStyles()}
				href={returnUrl}
			>
				Continue to the Guardian
			</ExternalLinkButton>
		</MinimalLayout>
	);
};
