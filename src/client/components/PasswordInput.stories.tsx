import React from 'react';
import { Meta } from '@storybook/react';

import { PasswordInput, PasswordInputProps } from './PasswordInput';

export default {
  title: 'Components/PasswordInput',
  component: PasswordInput,
} as Meta<PasswordInputProps>;

export const Default = (props: PasswordInputProps) => (
  <PasswordInput {...props} label="Password" />
);
Default.storyName = 'default';

export const WithError = (props: PasswordInputProps) => (
  <PasswordInput {...props} label="Password" error="Error" />
);
WithError.storyName = 'with error';

export const WithSupporting = (props: PasswordInputProps) => (
  <PasswordInput
    {...props}
    label="New password"
    supporting="Must be between 8 and 72 characters"
  />
);
WithSupporting.storyName = 'with supporting text';

export const WithoutEye = (props: PasswordInputProps) => (
  <PasswordInput
    {...props}
    label="New password"
    supporting="Must be between 8 and 72 characters"
    displayEye={false}
  />
);
WithoutEye.storyName = 'without eye';
