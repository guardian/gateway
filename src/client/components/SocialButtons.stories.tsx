import React from 'react';
import { Meta } from '@storybook/react';

import { SocialButtons } from './SocialButtons';

export default {
  title: 'Components/SocialButtons',
  component: SocialButtons,
} as Meta;

export const Desktop = () => (
  <SocialButtons returnUrl="https://www.theguardian.com/uk/" />
);
Desktop.storyName = 'At desktop';
Desktop.parameters = {
  viewport: {
    defaultViewport: 'DESKTOP',
  },
};

export const Mobile = () => (
  <SocialButtons returnUrl="https://www.theguardian.com/uk/" />
);
Mobile.storyName = 'At mobile 320';
Mobile.parameters = {
  viewport: {
    defaultViewport: 'MOBILE_320',
  },
};
