import React from 'react';
import { Meta } from '@storybook/react';

import { PasswordWeakMessage } from './PasswordWeakMessage';

export default {
  title: 'Components/PasswordWeakMessage',
  component: PasswordWeakMessage,
} as Meta;

export const Default = () => <PasswordWeakMessage />;
Default.storyName = 'default';
