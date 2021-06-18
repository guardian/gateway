import React from 'react';
import { Meta } from '@storybook/react';

import { Registration } from './Registration';

export default {
  title: 'Pages/Registration',
  component: Registration,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => <Registration />;
Default.story = {
  name: 'with defaults',
};

export const ReturnUrl = () => (
  <Registration returnUrl="https://www.theguardian.com/uk" />
);
ReturnUrl.story = {
  name: 'with returnUrl',
};

export const Email = () => <Registration email="someone@theguardian.com" />;
Email.story = {
  name: 'with email',
};
