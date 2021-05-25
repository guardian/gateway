import React from 'react';
import { Meta } from '@storybook/react';

import { Header } from './Header';
import { Nav } from './Nav';

export default {
  title: 'Components/Nav',
  component: Nav,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Register = () => (
  <>
    <Header />
    <Nav
      tabs={[
        {
          displayText: 'Sign in',
          linkTo: '',
          isActive: false,
        },
        {
          displayText: 'Register',
          linkTo: '',
          isActive: true,
        },
      ]}
    />
  </>
);
Register.storyName = 'with register active';

export const SignIn = () => (
  <>
    <Header />
    <Nav
      tabs={[
        {
          displayText: 'Sign in',
          linkTo: '',
          isActive: true,
        },
        {
          displayText: 'Register',
          linkTo: '',
          isActive: false,
        },
      ]}
    />
  </>
);
SignIn.storyName = 'with signin active';
SignIn.parameters = {
  chromatic: { viewports: [480] },
};

export const Wide = () => (
  <>
    <Header />
    <Nav
      tabs={[
        {
          displayText: 'Sign in',
          linkTo: '',
          isActive: true,
        },
        {
          displayText: 'Register',
          linkTo: '',
          isActive: false,
        },
      ]}
    />
  </>
);
Wide.storyName = 'at wide breakpoint';
Wide.parameters = {
  viewport: {
    defaultViewport: 'WIDE',
  },
  chromatic: { viewports: [1300] },
};

export const NoBreakpoint = () => (
  <>
    <Header />
    <Nav
      tabs={[
        {
          displayText: 'Sign in',
          linkTo: '',
          isActive: true,
        },
        {
          displayText: 'Register',
          linkTo: '',
          isActive: false,
        },
      ]}
    />
  </>
);
NoBreakpoint.storyName = 'at full width';
NoBreakpoint.parameters = {
  viewport: {
    defaultViewport: 'does_not_exist',
  },
  chromatic: { disable: true },
};
