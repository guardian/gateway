import React from 'react';
import { Meta } from '@storybook/react';

import { Registration, RegistrationProps } from './Registration';

export default {
  title: 'Pages/Registration',
  component: Registration,
  parameters: { layout: 'fullscreen' },
  args: {
    recaptchaSiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  },
} as Meta<RegistrationProps>;

export const Default = (args: RegistrationProps) => <Registration {...args} />;
Default.story = {
  name: 'with defaults',
};

export const ReturnUrl = (args: RegistrationProps) => (
  <Registration {...args} returnUrl="https://www.theguardian.com/uk" />
);
ReturnUrl.story = {
  name: 'with returnUrl',
};

export const Email = (args: RegistrationProps) => (
  <Registration {...args} email="someone@theguardian.com" />
);
Email.story = {
  name: 'with email',
};

export const InvalidRecaptcha = (args: RegistrationProps) => (
  <Registration {...args} recaptchaSiteKey="" />
);
InvalidRecaptcha.story = {
  name: 'with invalid reCAPTCHA',
};
