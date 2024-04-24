/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { SubscriptionError } from '@/client/pages/SubscriptionError';

export default {
	title: 'Pages/SubscriptionError',
	component: SubscriptionError,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Unsubscribe = () => (
	<SubscriptionError accountManagementUrl="#" action={'unsubscribe'} />
);
Unsubscribe.story = {
	name: 'unsubscribe error',
};

export const Subscribe = () => (
	<SubscriptionError accountManagementUrl="#" action={'subscribe'} />
);
Subscribe.story = {
	name: 'subscribe error',
};
