import React from 'react';
import { Meta } from '@storybook/react';

import { SocialButtons } from './SocialButtons';

export default {
  title: 'Components/SocialButtons',
  component: SocialButtons,
} as Meta;

export const Desktop = () => (
  <SocialButtons
    queryParams={{ returnUrl: 'https://www.theguardian.com/uk/' }}
  />
);
Desktop.storyName = 'At desktop';
Desktop.parameters = {
  viewport: {
    defaultViewport: 'DESKTOP',
  },
  chromatic: { viewports: [1300] },
};

export const Mobile = () => (
  <SocialButtons
    queryParams={{ returnUrl: 'https://www.theguardian.com/uk/' }}
  />
);
Mobile.storyName = 'At mobile 320';
Mobile.parameters = {
  viewport: {
    defaultViewport: 'MOBILE_320',
  },
  chromatic: { viewports: [320] },
};

export const NativeAppAndroid = () => (
  <SocialButtons
    queryParams={{ returnUrl: 'https://www.theguardian.com/uk/' }}
    isNativeApp="android"
  />
);
NativeAppAndroid.storyName = 'Android native app';

export const NativeAppIos = () => (
  <SocialButtons
    queryParams={{ returnUrl: 'https://www.theguardian.com/uk/' }}
    isNativeApp="ios"
  />
);
NativeAppIos.storyName = 'iOS native app';
