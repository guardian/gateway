import React from 'react';
import { ExternalLink } from '@/client/components/ExternalLink';
import { MainBodyText } from '@/client/components/MainBodyText';
import {
	SubscriptionAction,
	subscriptionActionName,
} from '@/shared/lib/subscriptions';
import { MinimalLayout } from '../layouts/MinimalLayout';

type SubscriptionErrorProps = {
	accountManagementUrl?: string;
	action: SubscriptionAction;
};

export const SubscriptionError = ({
	accountManagementUrl = 'https://manage.theguardian.com',
	action,
}: SubscriptionErrorProps) => {
	return (
		<MinimalLayout pageHeader={`${subscriptionActionName(action)} Error`}>
			<MainBodyText>Unable to {action}. Please try again.</MainBodyText>
			<MainBodyText>
				If the problem persists, please{' '}
				<ExternalLink
					href={`${accountManagementUrl}/help-centre/contact-us/account`}
				>
					contact our help department
				</ExternalLink>
				.
			</MainBodyText>
			<MainBodyText>
				You can{' '}
				<ExternalLink href={`${accountManagementUrl}/email-prefs`}>
					manage your email preferences
				</ExternalLink>{' '}
				at any time.
			</MainBodyText>
		</MinimalLayout>
	);
};
