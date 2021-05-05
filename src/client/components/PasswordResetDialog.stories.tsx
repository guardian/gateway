/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { PasswordResetDialog } from './PasswordResetDialog';

export default {
  title: 'Components/PasswordResetDialog',
  component: PasswordResetDialog,
} as Meta;

export const Default = () => (
  <PasswordResetDialog
    headerText="Forgotten password"
    bodyText="Forgotten or need to set your password? We will email you a link to change or set it."
    buttonText="Reset Password"
  />
);
Default.story = {
  name: 'with defaults',
};

export const Email = () => (
  <PasswordResetDialog
    email="cleo@theguardian.com"
    headerText="Forgotten password"
    bodyText="Forgotten or need to set your password? We will email you a link to change or set it."
    buttonText="Reset Password"
  />
);
Email.story = {
  name: 'with email',
};
