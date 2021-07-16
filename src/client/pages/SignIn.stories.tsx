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

export const WithEmail = () => <SignIn email="test@example.com" />;
WithEmail.story = {
  name: 'with email',
};

export const WithSummaryError = () => (
  <SignIn errorSummary="This is an error" />
);
WithSummaryError.story = {
  name: 'with summary error',
};

export const WithSummaryErrorAndEmail = () => (
  <SignIn errorSummary="This is an error" email="test@example.com" />
);
WithSummaryErrorAndEmail.story = {
  name: 'with summary error and email',
};
