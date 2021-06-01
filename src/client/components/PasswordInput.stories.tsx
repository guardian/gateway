import React from 'react';
import { Meta } from '@storybook/react';

import { PasswordInput } from './PasswordInput';

export default {
  title: 'Components/PasswordInput',
  component: PasswordInput,
} as Meta;

export const Default = () => <PasswordInput label="Enter password" />;
Default.storyName = 'default';
