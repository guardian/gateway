import React from 'react';
import { Meta } from '@storybook/react';

import { CreatePassword } from './CreatePassword';
import { renderMJML } from '../../testUtils';

export default {
  title: 'Email/Templates/CreatePassword',
  component: CreatePassword,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => {
  return renderMJML(<CreatePassword />);
};
Default.storyName = 'with defaults';
