/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { SubscriptionSuccess } from './SubscriptionSuccess';

export default {
  title: 'Pages/SubscriptionSuccess',
  component: SubscriptionSuccess,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
  <SubscriptionSuccess
    accountManagementUrl="#"
    returnUrl="#"
    action={'unsubscribe'}
  />
);
Default.story = {
  name: 'with defaults',
};
