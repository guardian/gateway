import React from 'react';
import { Meta } from '@storybook/react';

import NameInputFieldset from './NameInputFieldset';

export default {
  title: 'Components/NameInputFieldset',
  component: NameInputFieldset,
} as Meta;

export const Default = () => {
  return <NameInputFieldset />;
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
