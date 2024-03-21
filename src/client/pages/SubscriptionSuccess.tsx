import React from 'react';
import { ExternalLink } from '@/client/components/ExternalLink';
import { MainBodyText } from '@/client/components/MainBodyText';
import {
	SubscriptionAction,
	subscriptionActionName,
} from '@/shared/lib/subscriptions';
import { MinimalLayout } from '../layouts/MinimalLayout';

type UnsubscribeSuccessProps = {
	action: SubscriptionAction;
	returnUrl?: string;
	accountManagementUrl?: string;
};

export const SubscriptionSuccess = ({
	action,
	returnUrl = 'https://www.theguardian.com',
	accountManagementUrl = 'https://manage.theguardian.com',
}: UnsubscribeSuccessProps) => {
	return (
		<MinimalLayout
			pageHeader={`${subscriptionActionName(action)} Confirmation`}
		>
			<MainBodyText>
				You have been {action}d. These changes can take up to 24 hours to take
				effect.
			</MainBodyText>
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
