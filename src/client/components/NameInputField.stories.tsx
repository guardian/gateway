import React from 'react';
import { Meta } from '@storybook/react';

import NameInput from './NameInputField';

export default {
  title: 'Components/NameInputFieldset',
  component: NameInput,
} as Meta;

export const Default = () => {
  return <NameInput />;
};
Default.storyName = 'default';

// export const WithEmptyError = () => (
//   <EmailInput defaultValue="" initialState={EmailInputFieldState.EMPTY} />
// );
// WithEmptyError.storyName = 'with empty error';

// export const WithInvalidError = () => (
//   <EmailInput
//     defaultValue="invalid.email"
//     initialState={EmailInputFieldState.INVALID}
//   />
// );
// WithInvalidError.storyName = 'with invalid error';
