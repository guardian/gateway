import React from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { SubscriptionAction } from '@/shared/lib/subscriptions';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { MainForm } from '../components/MainForm';
import useClientState from '../lib/hooks/useClientState';

type SubscriptionReviewProps = {
	action: SubscriptionAction;
	shortRequestId?: string;
};

export const SubscriptionReview = ({
	action,
	shortRequestId,
}: SubscriptionReviewProps) => {
	const clientState = useClientState();
	const { pageData = {} } = clientState;
	const { emailType, encodedSubscriptionData, token, emailTitle } = pageData;

	const subscribePageTitle = emailTitle
		? `Confirm your subscription to ${emailTitle}`
		: 'Confirm your subscription';

	const unsubscribePageTitle = 'Confirm unsubscribe';

	const leadText =
		action === 'subscribe'
			? 'Click below to complete your newsletter sign up'
			: 'Please click below to complete your unsubscribe from this list:';

	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader={
				action === 'subscribe' ? subscribePageTitle : unsubscribePageTitle
			}
			leadText={<MainBodyText>{leadText}</MainBodyText>}
		>
			{action === 'subscribe' && (
				<MainForm
					formAction={`/subscribe/${emailType}/${encodedSubscriptionData}/${token}`}
					submitButtonText="Confirm Subscription"
					submitButtonPriority="primary"
					disableOnSubmit={true}
				></MainForm>
			)}
			{action === 'unsubscribe' && (
				<MainForm
					formAction={`/unsubscribe/${emailType}/${encodedSubscriptionData}/${token}`}
					submitButtonText="Confirm unsubscribe"
					submitButtonPriority="primary"
					disableOnSubmit={true}
				></MainForm>
			)}
		</MinimalLayout>
	);
};
