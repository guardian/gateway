import React from 'react';
import { Meta } from '@storybook/react';

import { Header } from './Header';

export default {
  title: 'Components/Header',
  component: Header,
} as Meta;

export const Desktop = () => <Header />;
Desktop.storyName = 'At desktop';
Desktop.parameters = {
  viewport: {
    defaultViewport: 'DESKTOP',
  },
};

export const Mobile = () => <Header />;
Mobile.storyName = 'At mobile';
Mobile.parameters = {
  viewport: {
    defaultViewport: 'MOBILE',
  },
};

export const Tablet = () => <Header />;
Tablet.storyName = 'At tablet';
Tablet.parameters = {
  viewport: {
    defaultViewport: 'TABLET',
  },
};
