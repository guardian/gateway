import React from 'react';
import { Meta } from '@storybook/react';

import { SocialButtons } from './SocialButtons';

export default {
  title: 'Components/SocialButtons',
  component: SocialButtons,
} as Meta;

export const Default = () => (
  <SocialButtons returnUrl="https://www.theguardian.com/uk/" />
);
Default.storyName = 'with defaults';
