/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { EmailInput } from '../components/EmailInput.importable';

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
  // Input text and blur to trigger error
  fireEvent.change(emailInput, { target: { value: '' } });
  fireEvent.blur(emailInput);
  expect(emailInput.value).toEqual('');

  // Check error message
  const error = queryByText('Please enter your email.');
  expect(error).toBeInTheDocument();
});

test('errors with an invalid email', async () => {
  const { emailInput, queryByText } = setup();
  // Input text and blur to trigger error
  fireEvent.change(emailInput, { target: { value: 'invalid.email.com' } });
  fireEvent.blur(emailInput);
  expect(emailInput.value).toEqual('invalid.email.com');

  // Check error message
  const error = queryByText('Please enter a valid email format.');
  expect(error).toBeInTheDocument();
});

test('does not error with a valid email', async () => {
  const { emailInput, queryByText } = setup();
  // Input text and blur to trigger error
  fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
  fireEvent.blur(emailInput);
  expect(emailInput.value).toEqual('valid@email.com');

  // Check error message
  const invalidEmailError = queryByText('Please enter a valid email format.');
  const noInputError = queryByText('Please enter your email.');

  expect(invalidEmailError).not.toBeInTheDocument();
  expect(noInputError).not.toBeInTheDocument();
});

test('error is corrected once a valid email is submitted', async () => {
  const { emailInput, queryByText } = setup();
  // Input text and blur to trigger error
  fireEvent.change(emailInput, { target: { value: 'invalid.email.com' } });
  fireEvent.blur(emailInput);
  expect(emailInput.value).toEqual('invalid.email.com');

  // Check error message
  const error = queryByText('Please enter a valid email format.');
  expect(error).toBeInTheDocument();

  // Input text and blur to trigger error
  fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
  fireEvent.blur(emailInput);
  expect(emailInput.value).toEqual('valid@email.com');

  // Check error message
  const invalidEmailError = queryByText('Please enter a valid email format.');
  const noInputError = queryByText('Please enter your email.');
  expect(invalidEmailError).not.toBeInTheDocument();
  expect(noInputError).not.toBeInTheDocument();
});
