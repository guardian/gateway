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

export const FieldErrorPW = () => (
  <Welcome
    submitUrl=""
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
