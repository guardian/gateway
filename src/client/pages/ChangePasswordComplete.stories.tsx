/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { ChangePasswordComplete } from './ChangePasswordComplete';

export default {
  title: 'Pages/ChangePasswordComplete',
  component: ChangePasswordComplete,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
  <ChangePasswordComplete headerText="Password updated" />
);
Default.story = {
  name: 'with defaults',
};

export const Email = () => (
  <ChangePasswordComplete
    headerText="Password updated"
    email="example@theguardian.com"
  />
);
Email.story = {
  name: 'with email',
};

export const ReturnUrl = () => (
  <ChangePasswordComplete
    headerText="Password updated"
    email="example@theguardian.com"
    returnUrl="https://theguardian.com"
  />
);
ReturnUrl.story = {
  name: 'with email and return url',
};

export const SetPassword = () => (
  <ChangePasswordComplete
    headerText="Password created"
    email="example@theguardian.com"
  />
);
SetPassword.story = {
  name: 'set password complete page',
};
