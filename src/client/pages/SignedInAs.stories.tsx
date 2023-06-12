import React from 'react';
import { Meta } from '@storybook/react';

import { SignedInAs } from './SignedInAs';

export default {
  title: 'Pages/SignedInAs',
  component: SignedInAs,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
  <SignedInAs email="test@example.com" continueLink="#" signOutLink="#" />
);

export const NativeApp = () => (
  <SignedInAs
    email="test@example.com"
    continueLink="#"
    signOutLink="#"
    isNativeApp="android"
  />
);

export const Error = () => (
  <SignedInAs
    email="test@example.com"
    continueLink="#"
    signOutLink="#"
    pageError={'Something went wrong'}
  />
);
