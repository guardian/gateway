import React from 'react';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { primaryButtonStyles } from '../styles/Shared';
import { GeoLocation } from '@/shared/model/Geolocation';
import { MainBodyText } from '@/client/components/MainBodyText';
import {
	InformationBox,
	InformationBoxText,
} from '@/client/components/InformationBox';

export interface NewAccountReviewProps {
	shortRequestId?: string;
	nextPage: string;
	geolocation?: GeoLocation;
}

export const NewAccountReview = ({
	shortRequestId,
	nextPage,
	geolocation,
}: NewAccountReviewProps) => {
	const formTrackingName = 'new-account-review';
	usePageLoadOphanInteraction(formTrackingName);

	if (geolocation === 'US') {
		return (
			<MinimalLayout
				shortRequestId={shortRequestId}
				pageHeader="Welcome to the Guardian."
				imageId="welcome"
			>
				<>
					<MainBodyText>
						With your Guardian account you’ll receive First Thing and Saturday
						Edition as well as the Best Of the Guardian.
					</MainBodyText>
					<MainBodyText>
						Start your day with the most important news from the US and around
						the world. On Saturdays, you’ll get an exclusive email from
						Katharine Viner, the Guardian’s editor-in-chief, highlighting the
						best journalism from our global newsroom.
					</MainBodyText>
					<InformationBox>
						<InformationBoxText>
							Our newsletters may contain information about Guardian products,
							services and chosen charities or online advertisements. You&#39;ll
							You&#39;ll also receive information on our products and ways to
							support and enjoy our journalism. Visit &#34;Emails &
							marketing&#34; in your account to opt out.
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
	}

	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader="You're signed in! Welcome to the Guardian."
			imageId="welcome"
		>
			<ExternalLinkButton cssOverrides={primaryButtonStyles()} href={nextPage}>
				Continue
			</ExternalLinkButton>
		</MinimalLayout>
	);
};
