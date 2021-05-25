import React from 'react';
import { css } from '@emotion/react';
import { Meta } from '@storybook/react';

import { Footer } from './Footer';

export default {
  title: 'Components/Footer',
  component: Footer,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Desktop = () => <Footer />;
Desktop.storyName = 'At desktop';
Desktop.parameters = {
  viewport: {
    defaultViewport: 'DESKTOP',
  },
};

export const Mobile = () => <Footer />;
Mobile.storyName = 'At mobile';
Mobile.parameters = {
  viewport: {
    defaultViewport: 'MOBILE',
  },
};

export const Tablet = () => <Footer />;
Tablet.storyName = 'At tablet';
Tablet.parameters = {
  viewport: {
    defaultViewport: 'TABLET',
  },
};
