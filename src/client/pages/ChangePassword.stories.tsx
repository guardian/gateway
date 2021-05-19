import React from 'react';
import { Meta } from '@storybook/react';

import { ChangePassword } from './ChangePassword';

export default {
  title: 'Pages/ChangePassword',
  component: ChangePassword,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
  <ChangePassword submitUrl="" email="" fieldErrors={[]} idapiBaseUrl="" />
);
Default.story = {
  name: 'with defaults',
};

export const Email = () => (
  <ChangePassword
    submitUrl=""
    email="example@theguardian.com"
    fieldErrors={[]}
    idapiBaseUrl="https"
  />
);
Email.story = {
  name: 'with email',
};

export const FieldErrorPW = () => (
  <ChangePassword
    submitUrl=""
    email="example@theguardian.com"
    fieldErrors={[
      {
        field: 'password',
        message: 'Not right',
      },
    ]}
    idapiBaseUrl=""
  />
);
FieldErrorPW.story = {
  name: 'with error on password',
};

export const FieldErrorConfirm = () => (
  <ChangePassword
    submitUrl=""
    email="example@theguardian.com"
    fieldErrors={[
      {
        field: 'password_confirm',
        message: 'Not right',
      },
    ]}
    idapiBaseUrl=""
  />
);
FieldErrorConfirm.story = {
  name: 'with error on confirmation',
};
