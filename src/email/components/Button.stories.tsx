import React from 'react';
import { Meta } from '@storybook/react';

import { Button } from './Button';
import { renderMJMLComponent } from '../testUtils';

export default {
  title: 'Email/Button',
  component: Button,
} as Meta;

export const Default = () => {
  return renderMJMLComponent(<Button href="">Test Email Button</Button>);
};
Default.storyName = 'Default email button';
