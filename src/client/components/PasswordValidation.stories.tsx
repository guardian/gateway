import React from 'react';
import { Meta } from '@storybook/react';

import { WeakPasswordComponent as PasswordValidation } from './PasswordValidation';

export default {
  title: 'Components/PasswordValidation',
  component: PasswordValidation,
} as Meta;

export const Default = () => <PasswordValidation />;
Default.storyName = 'default';
