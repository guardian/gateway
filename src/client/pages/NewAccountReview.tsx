import React from 'react';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { primaryButtonStyles } from '../styles/Shared';

export interface NewAccountReviewProps {
	shortRequestId?: string;
	nextPage: string;
}

export const NewAccountReview = ({
	shortRequestId,
	nextPage,
}: NewAccountReviewProps) => {
	const formTrackingName = 'new-account-review';
	usePageLoadOphanInteraction(formTrackingName);

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
