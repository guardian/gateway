import React from 'react';
import { Meta } from '@storybook/react';

import { Welcome } from './Welcome';

export default {
  title: 'Pages/Welcome',
  component: Welcome,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => <Welcome submitUrl="" email="" fieldErrors={[]} />;
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
        message: 'Not right',
      },
    ]}
  />
);
FieldErrorPW.story = {
  name: 'with error on password',
};
