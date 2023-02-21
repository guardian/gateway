/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { EmailSent } from './EmailSent';

export default {
  title: 'Pages/EmailSent',
  component: EmailSent,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Defaults = () => <EmailSent changeEmailPage="/reset-password" />;
Defaults.story = {
  name: 'with defaults',
};

export const WithEmail = () => (
  <EmailSent
    changeEmailPage="/reset-password"
    email="example@theguardian.com"
  />
);
WithEmail.story = {
  name: 'with email',
};

export const WithEmailResend = () => (
  <EmailSent
    changeEmailPage="/reset-password"
    email="example@theguardian.com"
    resendEmailAction="#"
    recaptchaSiteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
  />
);
WithEmailResend.story = {
  name: 'with email and resend',
};

export const WithEmailResendNoAccount = () => (
  <EmailSent
    changeEmailPage="/reset-password"
    email="example@theguardian.com"
    resendEmailAction="#"
    noAccountInfo
    recaptchaSiteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
  />
);
WithEmailResendNoAccount.story = {
  name: 'with email, resend, and no account text',
};

export const WithRecaptchaError = () => (
  <EmailSent
    changeEmailPage="/reset-password"
    email="example@theguardian.com"
    resendEmailAction="#"
    recaptchaSiteKey="invalid-key"
  />
);
WithRecaptchaError.story = {
  name: 'with reCAPTCHA error',
};

export const WithHelpText = () => (
  <EmailSent changeEmailPage="/reset-password" showHelp={true} />
);
WithHelpText.story = {
  name: 'with help text',
};
