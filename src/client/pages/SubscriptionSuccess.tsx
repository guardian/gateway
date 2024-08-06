import React from 'react';
import { ExternalLink } from '@/client/components/ExternalLink';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import type { SubscriptionAction } from '@/shared/lib/subscriptions';
import { subscriptionActionName } from '@/shared/lib/subscriptions';

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
			leadText={
				<MainBodyText>
					You have been {action}d. These changes can take up to 24 hours to take
					effect.
				</MainBodyText>
			}
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
