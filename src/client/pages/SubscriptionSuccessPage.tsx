import React, { useEffect } from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { sendOphanComponentEvent } from '@/client/lib/ophan';
import { SubscriptionSuccess } from '@/client/pages/SubscriptionSuccess';
import type { SubscriptionAction } from '@/shared/lib/subscriptions';

interface Props {
	action: SubscriptionAction;
}

export const SubscriptionSuccessPage = ({ action }: Props) => {
	const clientState = useClientState();
	const { pageData = {} } = clientState;
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
		<SubscriptionSuccess
			returnUrl={returnUrl}
			accountManagementUrl={accountManagementUrl}
			action={action}
		/>
	);
};
