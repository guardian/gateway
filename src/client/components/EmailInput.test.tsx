/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import EmailInput from './EmailInput';

const setup = () => {
  const utils = render(<EmailInput defaultValue="test@email.com" />);
  const emailInput = utils.getByDisplayValue(
    'test@email.com',
  ) as HTMLInputElement;
  return {
    emailInput,
    ...utils,
  };
};

test('errors with nothing submitted', async () => {
  const { emailInput, queryByText } = setup();
  fireEvent.change(emailInput, { target: { value: '' } });
  fireEvent.blur(emailInput);
  expect(emailInput.value).toEqual('');
  const error = queryByText('Please enter your email.');
  expect(error).toBeInTheDocument();
});

test('errors with an invalid email', async () => {
  const { emailInput, queryByText } = setup();
  fireEvent.change(emailInput, { target: { value: 'invalid.email.com' } });
  fireEvent.blur(emailInput);
  expect(emailInput.value).toEqual('invalid.email.com');
  const error = queryByText('Please enter a valid email format.');
  expect(error).toBeInTheDocument();
});

test('does not error with a valid email', async () => {
  const { emailInput, queryByText } = setup();
  fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
  fireEvent.blur(emailInput);
  expect(emailInput.value).toEqual('valid@email.com');
  const error = queryByText('Please enter a valid email format.');
  expect(error).not.toBeInTheDocument();
});
