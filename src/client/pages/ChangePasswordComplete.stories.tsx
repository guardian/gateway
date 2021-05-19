/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { ChangePasswordComplete } from './ChangePasswordComplete';

export default {
  title: 'Pages/ChangePasswordComplete',
  component: ChangePasswordComplete,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
  <ChangePasswordComplete returnUrl="https://theguardian.com/uk" />
);
