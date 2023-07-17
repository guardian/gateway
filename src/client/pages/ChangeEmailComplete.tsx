import React from 'react';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { buttonStyles, MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import { SvgArrowRightStraight } from '@guardian/source-react-components';

type ChangeEmailCompleteProps = {
	returnUrl?: string;
	accountManagementUrl?: string;
};

export const ChangeEmailComplete = ({
	returnUrl = 'https://www.theguardian.com',
	accountManagementUrl = 'https://manage.theguardian.com',
}: ChangeEmailCompleteProps) => {
	return (
		<MainLayout pageHeader="Email changed">
			<MainBodyText noMargin>
				Success! Your email address has been updated.
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
			<MainBodyText noMargin>
				<ExternalLinkButton
					priority="tertiary"
					css={buttonStyles({ halfWidth: true })}
					href={returnUrl}
					icon={<SvgArrowRightStraight />}
					iconSide="right"
				>
					Continue to the Guardian
				</ExternalLinkButton>
			</MainBodyText>
		</MainLayout>
	);
};
