import React from 'react';
import { Meta } from '@storybook/react';

import { ResetPassword } from './ResetPassword';
import { renderMJML } from '../../testUtils';

export default {
  title: 'Email/ResetPassword',
  component: ResetPassword,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => {
  return renderMJML(<ResetPassword token="abc" />);
};
Default.storyName = 'with defaults';
