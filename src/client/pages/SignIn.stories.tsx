import React from 'react';
import { Meta } from '@storybook/react';

import { SignIn } from './SignIn';

export default {
  title: 'Pages/SignIn',
  component: SignIn,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => <SignIn />;
Default.story = {
  name: 'with defaults',
};

export const withEmail = () => <SignIn email="test@example.com" />;
withEmail.story = {
  name: 'with email',
};

export const withSummaryError = () => (
  <SignIn errorSummary="This is an error" />
);
withSummaryError.story = {
  name: 'with summary error',
};

export const withSummaryErrorAndEmail = () => (
  <SignIn errorSummary="This is an error" email="test@example.com" />
);
withSummaryErrorAndEmail.story = {
  name: 'with summary error and email',
};
