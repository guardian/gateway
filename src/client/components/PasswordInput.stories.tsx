import React from 'react';
import { Meta } from '@storybook/react';

import { PasswordInput } from './PasswordInput';

export default {
  title: 'Components/PasswordInput',
  component: PasswordInput,
} as Meta;

export const Default = () => <PasswordInput label="Password" />;
Default.storyName = 'default';

export const WithError = () => <PasswordInput label="Password" error="Error" />;
WithError.storyName = 'with error';

export const WithSupporting = () => (
  <PasswordInput
    label="New password"
    supporting="Must be between 8 and 72 characters"
  />
);
WithSupporting.storyName = 'with supporting text';
