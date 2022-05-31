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
    displayRegisterTab: true,
  },
} as Meta<SignInProps>;

export const Default = (args: SignInProps) => <SignIn {...args} />;
Default.story = {
  name: 'with defaults',
};

export const WithEmail = (args: SignInProps) => (
  <SignIn email="test@example.com" {...args} />
);
WithEmail.story = {
  name: 'with email',
};

export const WithSummaryError = (args: SignInProps) => (
  <SignIn error="This is an error" {...args} />
);
WithSummaryError.story = {
  name: 'with summary error',
};

export const WithSummaryErrorAndEmail = (args: SignInProps) => (
  <SignIn error="This is an error" email="test@example.com" {...args} />
);
WithSummaryErrorAndEmail.story = {
  name: 'with summary error and email',
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

export const WithoutRegisterButton = (args: SignInProps) => (
  <SignIn {...args} displayRegisterTab={false} />
);
WithoutRegisterButton.story = {
  name: 'without register button',
};
