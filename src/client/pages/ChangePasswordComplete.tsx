import React from 'react';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { primaryButtonStyles } from '@/client/styles/Shared';

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
		<MinimalLayout
			pageHeader={headerText}
			leadText={
				<MainBodyText>
					The password for{' '}
					{email ? <strong>{email}</strong> : <>your account</>} was
					successfully {action}.
				</MainBodyText>
			}
		>
			<ExternalLinkButton css={primaryButtonStyles()} href={returnUrl}>
				Continue to the Guardian
			</ExternalLinkButton>
		</MinimalLayout>
	);
};
