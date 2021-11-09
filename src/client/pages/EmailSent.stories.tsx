/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { EmailSent } from './EmailSent';

export default {
  title: 'Pages/EmailSent',
  component: EmailSent,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Defaults = () => <EmailSent previousPage="/reset" />;
Defaults.story = {
  name: 'with defaults',
};

export const WithEmail = () => (
  <EmailSent previousPage="/reset" email="example@theguardian.com" />
);
WithEmail.story = {
  name: 'with email',
};

export const WithEmailResend = () => (
  <EmailSent
    previousPage="/reset"
    email="example@theguardian.com"
    resendEmailAction="#"
  />
);
WithEmailResend.story = {
  name: 'with email and resend',
};

export const WithEmailResendNoAccount = () => (
  <EmailSent
    previousPage="/reset"
    email="example@theguardian.com"
    resendEmailAction="#"
    noAccountInfoBox
  />
);
WithEmailResend.story = {
  name: 'with email, resend, and no account box',
};
