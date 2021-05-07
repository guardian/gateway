import React from 'react';
import { Meta } from '@storybook/react';

import { ResetPassword } from './ResetPassword';

export default {
  title: 'Pages/ResetPassword',
  component: ResetPassword,
} as Meta;

export const Default = () => (
  <ResetPassword
    headerText="Forgotten password"
    bodyText="Forgotten or need to set your password? We will email you a link to change or set it."
    buttonText="Reset Password"
  />
);
Default.story = {
  name: 'with defaults',
};

export const Email = () => (
  <ResetPassword
    email="cleo@theguardian.com"
    headerText="Forgotten password"
    bodyText="Forgotten or need to set your password? We will email you a link to change or set it."
    buttonText="Reset Password"
  />
);
Email.story = {
  name: 'with email',
};
