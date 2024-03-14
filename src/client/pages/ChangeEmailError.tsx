import React from 'react';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { MainBodyText } from '@/client/components/MainBodyText';
import { SvgArrowRightStraight } from '@guardian/source-react-components';
import { primaryButtonStyles } from '../styles/Shared';
import { MinimalLayout } from '../layouts/MinimalLayout';

type ChangeEmailErrorProps = {
	accountManagementUrl?: string;
};

export const ChangeEmailError = ({
	accountManagementUrl = 'https://manage.theguardian.com',
}: ChangeEmailErrorProps) => {
	return (
		<MinimalLayout pageHeader="Email change failed">
			<MainBodyText>
				The email change link you followed has expired or was invalid. Please
				return to your account details to try again.
			</MainBodyText>
			<ExternalLinkButton
				css={primaryButtonStyles}
				href={`${accountManagementUrl}/account-settings`}
				icon={<SvgArrowRightStraight />}
				iconSide="right"
			>
				Back to account details
			</ExternalLinkButton>
		</MinimalLayout>
	);
};
