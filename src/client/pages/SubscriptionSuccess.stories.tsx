/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { SubscriptionSuccess } from '@/client/pages/SubscriptionSuccess';

export default {
	title: 'Pages/SubscriptionSuccess',
	component: SubscriptionSuccess,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Unsubscribe = () => (
	<SubscriptionSuccess
		accountManagementUrl="#"
		returnUrl="#"
		action={'unsubscribe'}
	/>
);
Unsubscribe.story = {
	name: 'unsubscribe success',
};

export const Subscribe = () => (
	<SubscriptionSuccess
		accountManagementUrl="#"
		returnUrl="#"
		action={'subscribe'}
	/>
);
Subscribe.story = {
	name: 'subscribe success',
};
