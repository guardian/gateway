import React, { useEffect } from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { SubscriptionReview } from '@/client/pages/SubscriptionReview';
import { SubscriptionAction } from '@/shared/lib/subscriptions';
import { sendOphanComponentEvent } from '@/client/lib/ophan';

interface Props {
	action: SubscriptionAction;
}

export const SubscriptionReviewPage = ({ action }: Props) => {
	const clientState = useClientState();
	const { pageData = {}, shortRequestId } = clientState;
	const { returnUrl, accountManagementUrl, newsletterId } = pageData;

	useEffect(() => {
		if (action === 'subscribe' && newsletterId) {
			sendOphanComponentEvent({
				action: 'SUBSCRIBE',
				component: {
					componentType: 'NEWSLETTER_SUBSCRIPTION',
					id: newsletterId,
				},
			});
		}
	}, [action, newsletterId]);

	return (
		<SubscriptionReview
			returnUrl={returnUrl}
			accountManagementUrl={accountManagementUrl}
			action={action}
			shortRequestId={shortRequestId}
		/>
	);
};
