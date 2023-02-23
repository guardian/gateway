/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { UnsubscribeSuccess } from './UnsubscribeSuccess';

export default {
  title: 'Pages/UnsubscribeSuccess',
  component: UnsubscribeSuccess,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
  <UnsubscribeSuccess accountManagementUrl="#" returnUrl="#" />
);
Default.story = {
  name: 'with defaults',
};
