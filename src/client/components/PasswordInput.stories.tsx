import React from 'react';
import { Meta } from '@storybook/react';

import { PasswordInput } from './PasswordInput';

export default {
  title: 'Components/PasswordInput',
  component: PasswordInput,
} as Meta;

export const Default = () => (
  <PasswordInput label="New password" onChange={() => null} />
);
Default.storyName = 'default';

export const WithError = () => (
  <PasswordInput label="New password" onChange={() => null} error="Error" />
);
WithError.storyName = 'with error';
