import React from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { primaryButtonStyles } from '@/client/styles/Shared';

type Props = {
	returnUrl: string;
};

export const DeleteAccountComplete = ({ returnUrl }: Props) => {
	return (
		<MinimalLayout
			pageHeader="Account deleted"
			leadText={
				<MainBodyText>
					Your Guardian account has been successfully deleted and you have also
					been signed out. Click the button below to return to the Guardian.
				</MainBodyText>
			}
		>
			<ExternalLinkButton cssOverrides={primaryButtonStyles()} href={returnUrl}>
				Return to the Guardian
			</ExternalLinkButton>
		</MinimalLayout>
	);
};
