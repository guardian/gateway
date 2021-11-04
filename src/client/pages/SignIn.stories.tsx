import React from 'react';
import { Meta } from '@storybook/react';

import { SignIn, SignInProps } from './SignIn';
import { SignInErrors } from '@/shared/model/Errors';

export default {
  title: 'Pages/SignIn',
  component: SignIn,
  parameters: { layout: 'fullscreen' },
  args: {
    oauthBaseUrl: 'https://oauth.theguardian.com/',
  },
} as Meta<SignInProps>;

export const Default = (args: SignInProps) => <SignIn {...args} />;
Default.story = {
  name: 'with defaults',
};

export const SocialSigninBlocked = (args: SignInProps) => (
  <SignIn {...args} error={SignInErrors.ACCOUNT_ALREADY_EXISTS} />
);
SocialSigninBlocked.story = {
  name: 'social sign-in blocked',
};
