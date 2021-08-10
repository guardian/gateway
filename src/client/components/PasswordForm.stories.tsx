import React from 'react';
import { Meta } from '@storybook/react';

import { PasswordForm } from './PasswordForm';

export default {
  title: 'Components/PasswordForm',
  component: PasswordForm,
} as Meta;

export const Default = () => (
  <PasswordForm
    submitUrl=""
    fieldErrors={[]}
    submitButtonText="Save password"
  />
);
Default.storyName = 'default';
