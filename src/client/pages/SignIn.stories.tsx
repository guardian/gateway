import React from 'react';
import { Meta } from '@storybook/react';

import { SignIn } from './SignIn';

export default {
  title: 'Pages/SignIn',
  component: SignIn,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
  <SignIn oauthBaseUrl="https://oauth.theguardian.com/" />
);
Default.story = {
  name: 'with defaults',
};
