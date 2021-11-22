/**
 * @jest-environment jsdom
 */
/** @jsx jsx */

import { jsx } from '@emotion/core';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MainForm, MainFormProps } from '../components/MainForm';

import { RenderOptions } from '@/client/lib/hooks/useRecaptcha';
import { DetailedRecaptchaError } from '../components/DetailedRecaptchaError';
import {
  setupRecaptchaScriptMutationObserver,
  setupRecaptchaObject,
} from '@/client/lib/hooks/utils';

const setup = (extraProps?: Partial<MainFormProps>) =>
  render(<MainForm formAction="/" submitButtonText="Submit" {...extraProps} />);

test('terms and conditions in the document when hasGuardianTerms is true', async () => {
  const { queryByText } = setup({ hasGuardianTerms: true });
  const terms = queryByText(
    'For information about how we use your data, see our',
    { exact: false },
  );
  await waitFor(() => {
    expect(terms).toBeInTheDocument();
  });
});

test('terms and conditions not in the document when hasGuardianTerms is false', async () => {
  const { queryByText } = setup({ hasGuardianTerms: false });
  const terms = queryByText(
    'For information about how we use your data, see our',
    { exact: false },
  );
  await waitFor(() => {
    expect(terms).toBeNull();
  });
});

test('does not render the reCAPTCHA terms and conditions when recaptchaSiteKey is undefined', async () => {
  const { queryByText } = setup();
  const terms = queryByText(
    'This site is protected by reCAPTCHA and the Google',
    { exact: false },
  );
  await waitFor(() => {
    expect(terms).toBeNull();
  });
});

test('renders the reCAPTCHA terms and conditions when recaptchaSiteKey is defined', async () => {
  const { queryByText } = setup({ recaptchaSiteKey: 'invalid-key' });
  const terms = queryByText(
    'This site is protected by reCAPTCHA and the Google',
    { exact: false },
  );
  await waitFor(() => {
    expect(terms).toBeInTheDocument();
  });
});

test('shows sets an error message when the reCAPTCHA check is unsuccessful', async () => {
  const setRecaptchaErrorMessage = jest.fn();
  setup({
    recaptchaSiteKey: 'invalid-key',
    setRecaptchaErrorMessage,
  });
  await waitFor(() => {
    expect(setRecaptchaErrorMessage).toBeCalled();
  });
});

test('calls the form submit override method if defined', async () => {
  const mockedSubmitOverride = jest.fn();
  const { findByText } = setup({
    onSubmitOverride: mockedSubmitOverride,
    recaptchaSiteKey: 'invalid-key',
  });

  const submitButton = await findByText('Submit');

  await waitFor(() => {
    expect(mockedSubmitOverride).toBeCalledTimes(0);
  });

  act(() => {
    fireEvent.click(submitButton);
  });

  await waitFor(() => {
    expect(mockedSubmitOverride).toBeCalledTimes(1);
  });
});

test('sets error message and context and prevents form submission when the reCAPTCHA check is unsuccessful', async () => {
  setupRecaptchaScriptMutationObserver();
  setupRecaptchaObject();

  // Mock the Google Recaptcha object
  const windowSpy = jest.spyOn(global.window, 'grecaptcha', 'get');
  const mockedGrecaptchaRender = jest.fn().mockReturnValue(0);
  const mockedGrecaptchaReset = jest.fn();
  const mockedGrecaptchaReady = jest.fn((callback) => callback());

  // Mock Google Recaptcha calling the success callback with a valid token.
  const mockedGrecaptchaExecute = jest.fn(() => {
    const renderOptions: RenderOptions =
      mockedGrecaptchaRender.mock.calls[0][1];
    // Simulate the error callback being called after the recaptcha check.
    renderOptions['error-callback'](undefined);
  });

  const setRecaptchaErrorMessage = jest.fn();
  const setRecaptchaErrorContext = jest.fn();

  const mockedFormSubmit = jest.fn();
  Object.defineProperty(window.HTMLFormElement.prototype, 'submit', {
    value: mockedFormSubmit,
  });

  const { findByText } = setup({
    recaptchaSiteKey: 'public-recaptcha-token',
    setRecaptchaErrorMessage,
    setRecaptchaErrorContext,
  });

  await waitFor(() => {
    // Simulate the grecaptcha object loading in after the hook is executed.
    windowSpy.mockImplementation(() => ({
      ready: mockedGrecaptchaReady,
      render: mockedGrecaptchaRender,
      execute: mockedGrecaptchaExecute,
      reset: mockedGrecaptchaReset,
    }));
  });

  // Check that the recaptcha render method was called.
  await waitFor(() => {
    expect(mockedGrecaptchaRender).toHaveBeenCalledWith(
      'recaptcha',
      expect.anything(),
    );
  });

  const submitButton = await findByText('Submit');

  act(() => {
    fireEvent.click(submitButton);
  });

  // Check that a recaptcha check has been requested.
  await waitFor(() => {
    expect(mockedGrecaptchaReset).toHaveBeenCalledTimes(1);
    expect(mockedGrecaptchaExecute).toHaveBeenCalledTimes(1);
    // Check form is not submitted.
    expect(mockedFormSubmit).toHaveBeenCalledTimes(0);
  });

  // Check that initial error message is shown.
  await waitFor(() => {
    expect(setRecaptchaErrorMessage).toBeCalledTimes(1);
    expect(setRecaptchaErrorMessage).toHaveBeenCalledWith(
      'Google reCAPTCHA verification failed. Please try again.',
    );
    expect(setRecaptchaErrorContext).not.toBeCalled();
  });

  act(() => {
    fireEvent.click(submitButton);
  });

  // Check that a second recaptcha check has been requested.
  await waitFor(() => {
    expect(mockedGrecaptchaReset).toHaveBeenCalledTimes(2);
    expect(mockedGrecaptchaExecute).toHaveBeenCalledTimes(2);
  });

  // Check that second error message is shown and error context is rendered.
  await waitFor(() => {
    expect(setRecaptchaErrorMessage).toBeCalledTimes(2);
    expect(setRecaptchaErrorMessage).toHaveBeenCalledWith(
      'Google reCAPTCHA verification failed.',
    );
    expect(setRecaptchaErrorContext).toBeCalledTimes(1);
    expect(setRecaptchaErrorContext).toHaveBeenCalledWith(
      expect.objectContaining({ type: DetailedRecaptchaError }),
    );
    // Check form is not submitted.
    expect(mockedFormSubmit).toHaveBeenCalledTimes(0);
  });

  windowSpy.mockRestore();
});

test('submits the form when the reCAPTCHA validation check is successful', async () => {
  // Set up recaptcha mocked script and object.
  setupRecaptchaScriptMutationObserver();
  setupRecaptchaObject();

  // Mock the Google Recaptcha object
  const windowSpy = jest.spyOn(global.window, 'grecaptcha', 'get');
  const mockedGrecaptchaRender = jest.fn().mockReturnValue(0);
  const mockedGrecaptchaReset = jest.fn();
  const mockedGrecaptchaReady = jest.fn((callback) => {
    callback();
  });
  // Mock Google Recaptcha calling the success callback with a valid token.
  const mockedGrecaptchaExecute = jest.fn(() => {
    const renderOptions: RenderOptions =
      mockedGrecaptchaRender.mock.calls[0][1];
    renderOptions.callback('valid-token');
  });

  const mockedFormSubmit = jest.fn();
  Object.defineProperty(window.HTMLFormElement.prototype, 'submit', {
    value: mockedFormSubmit,
  });

  const { findByText } = setup({
    recaptchaSiteKey: 'public-recaptcha-token',
  });

  await waitFor(() => {
    // Simulate the grecaptcha object loading in after the hook is executed.
    windowSpy.mockImplementation(() => ({
      ready: mockedGrecaptchaReady,
      render: mockedGrecaptchaRender,
      execute: mockedGrecaptchaExecute,
      reset: mockedGrecaptchaReset,
    }));
  });

  await waitFor(() => {
    // Check that the recaptcha render method was called.
    expect(mockedGrecaptchaRender).toHaveBeenCalledWith(
      'recaptcha',
      expect.anything(),
    );
  });

  const submitButton = await findByText('Submit');

  act(() => {
    fireEvent.click(submitButton);
  });

  await waitFor(() => {
    // Check that a recaptcha check has been requested.
    expect(mockedGrecaptchaReset).toHaveBeenCalledTimes(1);
    expect(mockedGrecaptchaExecute).toHaveBeenCalledTimes(1);
    // Check that the form is successfully submitted.
    expect(mockedFormSubmit).toHaveBeenCalledTimes(1);
  });

  windowSpy.mockRestore();
});
