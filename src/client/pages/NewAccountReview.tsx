import React from 'react';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { QueryParams } from '@/shared/model/QueryParams';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { primaryButtonStyles } from '../styles/Shared';

export interface NewAccountReviewProps {
	queryParams: QueryParams;
	shortRequestId?: string;
}

export const NewAccountReview = ({
	queryParams,
	shortRequestId,
}: NewAccountReviewProps) => {
	const formTrackingName = 'new-account-review';
	usePageLoadOphanInteraction(formTrackingName);

	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader="You're signed in! Welcome to the Guardian."
			imageId="welcome"
		>
			<ExternalLinkButton
				cssOverrides={primaryButtonStyles()}
				href={queryParams.returnUrl}
			>
				Continue
			</ExternalLinkButton>
		</MinimalLayout>
	);
};
