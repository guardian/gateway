import React from 'react';
import { Meta } from '@storybook/react';

import { PasswordInput } from './PasswordInput';

export default {
  title: 'Components/PasswordInput',
  component: PasswordInput,
} as Meta;

export const Default = () => <PasswordInput onChange={() => null} />;
Default.storyName = 'default';

export const WithError = () => (
  <PasswordInput onChange={() => null} error="Error" />
);
WithError.storyName = 'with error';
