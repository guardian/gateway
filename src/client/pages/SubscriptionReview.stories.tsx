import React from 'react';
import { Meta } from '@storybook/react';

import { SubscriptionReview } from '@/client/pages/SubscriptionReview';

export default {
	title: 'Pages/SubscriptionReview',
	component: SubscriptionReview,
} as Meta;

export const Unsubscribe = () => (
	<SubscriptionReview
		accountManagementUrl="#"
		returnUrl="#"
		action={'unsubscribe'}
	/>
);
Unsubscribe.story = {
	name: 'unsubscribe review',
};

export const Subscribe = () => (
	<SubscriptionReview
		accountManagementUrl="#"
		returnUrl="#"
		action={'subscribe'}
	/>
);
Subscribe.story = {
	name: 'subscribe review',
};
