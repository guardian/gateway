import React from 'react';
import { Meta } from '@storybook/react';

import { SubscriptionReview } from '@/client/pages/SubscriptionReview';

export default {
	title: 'Pages/SubscriptionReview',
	component: SubscriptionReview,
} as Meta;

export const Unsubscribe = () => <SubscriptionReview action={'unsubscribe'} />;
Unsubscribe.parameters = {
	clientState: {
		pageData: {
			emailTitle: 'Dobedo newsletter',
		},
	},
};
Unsubscribe.story = {
	name: 'unsubscribe review',
};

export const UnsubscribeWithoutNewsletterTitle = () => (
	<SubscriptionReview action={'unsubscribe'} />
);
UnsubscribeWithoutNewsletterTitle.story = {
	name: 'unsubscribe review (without Newsletter title)',
};

export const Subscribe = () => <SubscriptionReview action={'subscribe'} />;
Subscribe.parameters = {
	clientState: {
		pageData: {
			emailTitle: 'Dobedo newsletter',
		},
	},
};
Subscribe.story = {
	name: 'subscribe review',
};

export const SubscribeWithoutNewsletterTitle = () => (
	<SubscriptionReview action={'subscribe'} />
);
SubscribeWithoutNewsletterTitle.story = {
	name: 'subscribe review (without Newsletter title)',
};
