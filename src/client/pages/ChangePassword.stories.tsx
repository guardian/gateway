import React from 'react';
import { Meta } from '@storybook/react';

import { ChangePassword } from './ChangePassword';

export default {
  title: 'Pages/ChangePassword',
  component: ChangePassword,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
  <ChangePassword
    headerText="Reset password"
    buttonText="Confirm new password"
    submitUrl=""
    email=""
    fieldErrors={[]}
  />
);
Default.story = {
  name: 'with defaults',
};

export const Email = () => (
  <ChangePassword
    headerText="Reset password"
    buttonText="Confirm new password"
    submitUrl=""
    email="example@theguardian.com"
    fieldErrors={[]}
  />
);
Email.story = {
  name: 'with email',
};

export const FieldErrorPW = () => (
  <ChangePassword
    headerText="Reset password"
    buttonText="Confirm new password"
    submitUrl=""
    email="example@theguardian.com"
    fieldErrors={[
      {
        field: 'password',
        message: 'Not right',
      },
    ]}
  />
);
FieldErrorPW.story = {
  name: 'with error on password',
};
