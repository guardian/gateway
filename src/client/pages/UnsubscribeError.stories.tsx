/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { UnsubscribeError } from './UnsubscribeError';

export default {
  title: 'Pages/UnsubscribeError',
  component: UnsubscribeError,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => <UnsubscribeError accountManagementUrl="#" />;
Default.story = {
  name: 'with defaults',
};
