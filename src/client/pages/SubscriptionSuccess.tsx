import React from 'react';
import { ExternalLink } from '@/client/components/ExternalLink';
import { MainBodyText } from '@/client/components/MainBodyText';
import {
	SubscriptionAction,
	subscriptionActionName,
} from '@/shared/lib/subscriptions';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import useClientState from '../lib/hooks/useClientState';

type UnsubscribeSuccessProps = {
	action: SubscriptionAction;
	returnUrl?: string;
	accountManagementUrl?: string;
	shortRequestId?: string;
};

export const SubscriptionSuccess = ({
	action,
	returnUrl = 'https://www.theguardian.com',
	accountManagementUrl = 'https://manage.theguardian.com',
	shortRequestId,
}: UnsubscribeSuccessProps) => {
	const clientState = useClientState();
	const { pageData = {} } = clientState;
	const { emailTitle } = pageData;
	const subscribeOrUnsubscribe = subscriptionActionName(action);

	const getLeadText = () => {
		if (emailTitle && action === 'subscribe') {
			return (
				<MainBodyText>You're now subscribed to {emailTitle}.</MainBodyText>
			);
		} else if (action === 'unsubscribe') {
			return (
				<MainBodyText>
					You have been unsubscribed. These changes can take up to 24 hours to
					take effect.
				</MainBodyText>
			);
		}
	};
	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader={
				action === 'subscribe'
					? "You're signed up!"
					: `${subscribeOrUnsubscribe} Confirmation`
			}
			leadText={getLeadText()}
		>
			<MainBodyText>
				<ExternalLink href={`${accountManagementUrl}/email-prefs`}>
					Manage your email preferences
				</ExternalLink>
			</MainBodyText>
			<MainBodyText>
				<ExternalLink href={returnUrl}>Continue to the Guardian</ExternalLink>
			</MainBodyText>
		</MinimalLayout>
	);
};
