import React from 'react';
import { Meta } from '@storybook/react';

import { Button } from './Button';
import { renderMJML } from '../utility/render-mjml';

export default {
  title: 'Email/Button',
  component: Button,
} as Meta;

export const Default = () => {
  return renderMJML(<Button />);
};
Default.storyName = 'Default email button';
