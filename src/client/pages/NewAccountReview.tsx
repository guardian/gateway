import React from 'react';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { primaryButtonStyles } from '../styles/Shared';
import { GeoLocation } from '@/shared/model/Geolocation';
import { AutomaticSubscriptionNewsletterNotification } from '../components/AutomaticSubscriptionNewsletterNotification';

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
			<AutomaticSubscriptionNewsletterNotification
				shortRequestId={shortRequestId}
				nextPage={nextPage}
			/>
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
