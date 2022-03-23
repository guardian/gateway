import React from 'react';
import { Meta } from '@storybook/react';

import { EmailInput, EmailInputFieldState } from './EmailInput.importable';

export default {
  title: 'Components/EmailInput',
  component: EmailInput,
} as Meta;

export const Default = () => {
  return <EmailInput defaultValue="email@email.com" />;
};
Default.storyName = 'default';

export const WithEmptyError = () => (
  <EmailInput defaultValue="" initialState={EmailInputFieldState.EMPTY} />
);
WithEmptyError.storyName = 'with empty error';

export const WithInvalidError = () => (
  <EmailInput
    defaultValue="invalid.email"
    initialState={EmailInputFieldState.INVALID}
  />
);
WithInvalidError.storyName = 'with invalid error';
