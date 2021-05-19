/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { ResendEmailVerification } from './ResendEmailVerification';

export default {
  title: 'Pages/ResendEmailVerification',
  component: ResendEmailVerification,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const LoggedIn = () => (
  <ResendEmailVerification
    email="example@domain.com"
    successText="Here is some example success text"
    inboxLink="https://theguardian.com/uk"
    inboxName="Example"
  />
);
LoggedIn.story = {
  name: 'when logged in',
};

export const LoggedOut = () => (
  <ResendEmailVerification signInPageUrl="https://theguardian.com/uk" />
);
LoggedOut.story = {
  name: 'when logged out',
};
