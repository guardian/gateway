import React from 'react';
import { Meta } from '@storybook/react';

import { SignInSuccess } from './SignInSuccess';

export default {
  title: 'Pages/SignInSuccess',
  component: SignInSuccess,
  parameters: { layout: 'fullscreen' },
} as Meta;

const consents = [
  {
    id: 'supporter',
    name: 'Supporting the Guardian',
    description:
      'Stay up-to-date with our latest offers and the aims of the organisation, as well as the ways to enjoy and support our journalism.',
  },
];

export const Default = () => <SignInSuccess consents={consents} />;
Default.storyName = 'default';
