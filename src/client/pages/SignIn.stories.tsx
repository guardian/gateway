import React from 'react';
import { Meta } from '@storybook/react';

import { SignIn, SignInProps } from './SignIn';
import { SignInErrors } from '@/shared/model/Errors';

export default {
  title: 'Pages/SignIn',
  component: SignIn,
  parameters: { layout: 'fullscreen' },
  args: {
    recaptchaSiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
    oauthBaseUrl: 'https://oauth.theguardian.com/',
    queryParams: {
      returnUrl: 'https://www.theguardian.com/uk',
    },
  },
} as Meta<SignInProps>;

export const Default = (args: SignInProps) => <SignIn {...args} />;
Default.story = {
  name: 'with defaults',
};

export const SocialSigninBlocked = (args: SignInProps) => (
  <SignIn
    {...args}
    error={SignInErrors.ACCOUNT_ALREADY_EXISTS}
    email="someone@theguardian.com"
  />
);
SocialSigninBlocked.story = {
  name: 'social sign-in blocked',
};

export const InvalidRecaptcha = (args: SignInProps) => (
  <SignIn {...args} recaptchaSiteKey="invalid-key" />
);
InvalidRecaptcha.story = {
  name: 'with reCAPTCHA error',
};
