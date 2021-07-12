import React from 'react';
import { Meta } from '@storybook/react';

import { Verify } from './Verify';
import { renderMJML } from '../../testUtils';

export default {
  title: 'Email/Templates/Verify',
  component: Verify,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => {
  return renderMJML(<Verify />);
};
Default.storyName = 'with defaults';
