import React from 'react';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { MainBodyText } from '@/client/components/MainBodyText';
import { SvgArrowRightStraight } from '@guardian/source-react-components';
import { MinimalLayout } from '../layouts/MinimalLayout';
import { primaryButtonStyles, secondaryButtonStyles } from '../styles/Shared';

type ChangeEmailCompleteProps = {
	returnUrl?: string;
	accountManagementUrl?: string;
};

export const ChangeEmailComplete = ({
	returnUrl = 'https://www.theguardian.com',
	accountManagementUrl = 'https://manage.theguardian.com',
}: ChangeEmailCompleteProps) => {
	return (
		<MinimalLayout pageHeader="Email changed">
			<MainBodyText>Success! Your email address has been updated.</MainBodyText>
			<ExternalLinkButton
				css={primaryButtonStyles}
				href={`${accountManagementUrl}/account-settings`}
				icon={<SvgArrowRightStraight />}
				iconSide="right"
			>
				Back to account details
			</ExternalLinkButton>
			<ExternalLinkButton
				priority="tertiary"
				css={secondaryButtonStyles}
				href={returnUrl}
				icon={<SvgArrowRightStraight />}
				iconSide="right"
			>
				Continue to the Guardian
			</ExternalLinkButton>
		</MinimalLayout>
	);
};
