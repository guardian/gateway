import React from 'react';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { MainBodyText } from '@/client/components/MainBodyText';
import { primaryButtonStyles } from '@/client/styles/Shared';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';

type ChangePasswordCompleteProps = {
	headerText: string;
	email?: string;
	returnUrl?: string;
	action: 'created' | 'updated';
	shortRequestId?: string;
};

export const ChangePasswordComplete = ({
	headerText,
	email,
	returnUrl = 'https://www.theguardian.com/uk',
	action,
	shortRequestId,
}: ChangePasswordCompleteProps) => {
	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader={headerText}
			leadText={
				<MainBodyText>
					The password for{' '}
					{email ? <strong>{email}</strong> : <>your account</>} was
					successfully {action}.
				</MainBodyText>
			}
		>
			<ExternalLinkButton cssOverrides={primaryButtonStyles()} href={returnUrl}>
				Continue to the Guardian
			</ExternalLinkButton>
		</MinimalLayout>
	);
};
