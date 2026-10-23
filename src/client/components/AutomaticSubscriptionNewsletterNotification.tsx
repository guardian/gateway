import React from 'react';
import { MinimalLayout } from '../layouts/MinimalLayout';
import { MainBodyText } from './MainBodyText';
import { InformationBox, InformationBoxText } from './InformationBox';
import { ExternalLinkButton } from './ExternalLink';
import { primaryButtonStyles } from '../styles/Shared';

export const AutomaticSubscriptionNewsletterNotification = ({
	shortRequestId,
	nextPage,
	children,
}: {
	shortRequestId?: string;
	nextPage: string;
	children?: React.ReactNode;
}) => {
	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader="Welcome to the Guardian."
			imageId="welcome"
		>
			<>
				{children}
				<MainBodyText>
					With your Guardian account you’ll receive First Thing and Saturday
					Edition as well as the Best of the Guardian.
				</MainBodyText>
				<MainBodyText>
					Start your day with the most important news from the US and around the
					world. On Saturdays, you’ll get an exclusive email from Katharine
					Viner, the Guardian’s editor-in-chief, highlighting the best
					journalism from our global newsroom.
				</MainBodyText>
				<InformationBox>
					<InformationBoxText>
						We’ll send you emails about our journalism and ways to support and
						enjoy our work. You can unsubscribe at any time.
					</InformationBoxText>
				</InformationBox>
				<ExternalLinkButton
					cssOverrides={primaryButtonStyles()}
					href={nextPage}
				>
					Continue
				</ExternalLinkButton>
			</>
		</MinimalLayout>
	);
};
