import React from 'react';
import { MainLayout, buttonStyles } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import { ExternalLinkButton } from '@/client/components/ExternalLink';

type Props = {
	returnUrl: string;
};

export const DeleteAccountComplete = ({ returnUrl }: Props) => {
	return (
		<MainLayout pageHeader="Account deleted">
			<MainBodyText>
				Your Guardian account has been successfully deleted and you have also
				been signed out. Click the button below to return to the Guardian.
			</MainBodyText>
			<ExternalLinkButton
				css={buttonStyles({ halfWidth: true })}
				href={returnUrl}
			>
				Return to the Guardian
			</ExternalLinkButton>
		</MainLayout>
	);
};
