import React from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import {
	SubscriptionAction,
	subscriptionActionName,
} from '@/shared/lib/subscriptions';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { MainForm } from '../components/MainForm';
import useClientState from '../lib/hooks/useClientState';

type SubscriptionReviewProps = {
	action: SubscriptionAction;
	accountManagementUrl?: string;
	shortRequestId?: string;
};

export const SubscriptionReview = ({
	action,
	accountManagementUrl = 'https://manage.theguardian.com',
	shortRequestId,
}: SubscriptionReviewProps) => {
	const clientState = useClientState();
	const { pageData = {} } = clientState;
	const { emailType, encodedSubscriptionData, token, newsletterId } = pageData;

	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader={`${subscriptionActionName(action)} Review`}
			leadText={
				<MainBodyText>Are you sure you would like to {action}?</MainBodyText>
			}
		>
			<MainForm
				formAction={`/subscribe/${emailType}/${encodedSubscriptionData}/${token}`}
				submitButtonText="Confirm Subscription"
				submitButtonPriority="primary"
				disableOnSubmit={true}
			>
				<h2>Confirm your subscription</h2>
				<p>Please review and confirm your subscription details:</p>
				{newsletterId && <p>Newsletter ID: {newsletterId}</p>}
				<p>By clicking confirm, you agree to subscribe to this newsletter.</p>
				<p>
					<a href={accountManagementUrl}>
						Cancel and return to account management page.
					</a>
				</p>
			</MainForm>
		</MinimalLayout>
	);
};
