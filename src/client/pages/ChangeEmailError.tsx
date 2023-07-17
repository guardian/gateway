import React from 'react';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { buttonStyles, MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import { SvgArrowRightStraight } from '@guardian/source-react-components';

type ChangeEmailErrorProps = {
	accountManagementUrl?: string;
};

export const ChangeEmailError = ({
	accountManagementUrl = 'https://manage.theguardian.com',
}: ChangeEmailErrorProps) => {
	return (
		<MainLayout pageHeader="Email change failed">
			<MainBodyText noMargin>
				The email change link you followed has expired or was invalid. Please
				return to your account details to try again.
			</MainBodyText>
			<MainBodyText noMargin>
				<ExternalLinkButton
					css={buttonStyles({ halfWidth: true })}
					href={`${accountManagementUrl}/account-settings`}
					icon={<SvgArrowRightStraight />}
					iconSide="right"
				>
					Back to account details
				</ExternalLinkButton>
			</MainBodyText>
		</MainLayout>
	);
};
