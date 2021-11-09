import React from 'react';
import { Meta } from '@storybook/react';

import { Welcome } from './Welcome';

export default {
  title: 'Pages/Welcome',
  component: Welcome,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => <Welcome submitUrl="" fieldErrors={[]} />;
Default.story = {
  name: 'with defaults',
};

export const Email = () => (
  <Welcome submitUrl="" email="example@theguardian.com" fieldErrors={[]} />
);
Email.story = {
  name: 'with email',
};

export const FieldErrorPW = () => (
  <Welcome
    submitUrl=""
    email="example@theguardian.com"
    fieldErrors={[
      {
        field: 'password',
        message: 'Password must be between 8 and 72 characters.',
      },
    ]}
  />
);
FieldErrorPW.story = {
  name: 'with error on password',
};

export const PasswordAlreadySet = () => (
  <Welcome
    submitUrl=""
    email="example@theguardian.com"
    fieldErrors={[]}
    passwordSet={true}
  />
);
PasswordAlreadySet.story = {
  name: 'with password already set',
};
