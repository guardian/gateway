import React from 'react';
import { Meta } from '@storybook/react';

import { MagicLink } from './MagicLink';

export default {
  title: 'Pages/MagicLink',
  component: MagicLink,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => <MagicLink />;
Default.story = {
  name: 'with defaults',
};

export const Email = () => <MagicLink email="example@theguardian.com" />;
Email.story = {
  name: 'with email',
};

export const RecaptchaError = () => (
  <MagicLink recaptchaSiteKey="invalid-key" />
);
RecaptchaError.story = {
  name: 'with reCAPTCHA error',
};
