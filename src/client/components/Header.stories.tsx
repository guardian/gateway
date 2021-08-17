import React from 'react';
import { Meta } from '@storybook/react';

import { Header } from './Header';

export default {
  title: 'Components/Header',
  component: Header,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Desktop = () => (
  <>
    <Header />
    <br />
    <Header isAnniversary={true} />
  </>
);
Desktop.storyName = 'At desktop';
Desktop.parameters = {
  viewport: {
    defaultViewport: 'DESKTOP',
  },
};

export const Tablet = () => (
  <>
    <Header />
    <br />
    <Header isAnniversary={true} />
  </>
);
Tablet.storyName = 'At tablet';
Tablet.parameters = {
  viewport: {
    defaultViewport: 'TABLET',
  },
};

export const Mobile = () => (
  <>
    <Header />
    <br />
    <Header isAnniversary={true} />
  </>
);
Mobile.storyName = 'At mobile';
Mobile.parameters = {
  viewport: {
    defaultViewport: 'MOBILE',
  },
};
