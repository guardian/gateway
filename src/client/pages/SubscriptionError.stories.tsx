/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { SubscriptionError } from './SubscriptionError';

export default {
  title: 'Pages/SubscriptionError',
  component: SubscriptionError,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
  <SubscriptionError accountManagementUrl="#" action={'unsubscribe'} />
);
Default.story = {
  name: 'with defaults',
};
