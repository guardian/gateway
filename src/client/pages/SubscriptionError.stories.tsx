import React from 'react';
import { Meta } from '@storybook/react';

import { SubscriptionError } from '@/client/pages/SubscriptionError';

export default {
	title: 'Pages/SubscriptionError',
	component: SubscriptionError,
} as Meta;

export const Unsubscribe = () => (
	<SubscriptionError
		accountManagementUrl="#"
		action={'unsubscribe'}
		shortRequestId="123e4567"
	/>
);
Unsubscribe.story = {
	name: 'unsubscribe error',
};

export const Subscribe = () => (
	<SubscriptionError
		accountManagementUrl="#"
		action={'subscribe'}
		shortRequestId="123e4567"
	/>
);
Subscribe.story = {
	name: 'subscribe error',
};
