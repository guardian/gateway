import React from 'react';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { MainBodyText } from '@/client/components/MainBodyText';
import { primaryButtonStyles } from '../styles/Shared';
import { MinimalLayout } from '../layouts/MinimalLayout';

type ChangePasswordCompleteProps = {
	headerText: string;
	email?: string;
	returnUrl?: string;
	action: 'created' | 'updated';
};

export const ChangePasswordComplete = ({
	headerText,
	email,
	returnUrl = 'https://www.theguardian.com/uk',
	action,
}: ChangePasswordCompleteProps) => {
	return (
		<MinimalLayout pageHeader={headerText}>
			<MainBodyText>
				The password for {email ? <strong>{email}</strong> : <>your account</>}{' '}
				was successfully {action}.
			</MainBodyText>
			<ExternalLinkButton css={primaryButtonStyles} href={returnUrl}>
				Continue to the Guardian
			</ExternalLinkButton>
		</MinimalLayout>
	);
};
