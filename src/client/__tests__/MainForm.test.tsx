/**
 * @jest-environment jsdom
 */
/** @jsx jsx */

import { jsx } from '@emotion/react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import {
	setupRecaptchaObject,
	setupRecaptchaScriptMutationObserver,
} from '@/client/lib/hooks/__tests__/utils/useRecaptchaTestUtils';
import type { RenderOptions } from '@/client/lib/hooks/useRecaptcha';
import { DetailedRecaptchaError } from '../components/DetailedRecaptchaError';
import type { MainFormProps } from '../components/MainForm';
import { MainForm } from '../components/MainForm';

const setup = (extraProps?: Partial<MainFormProps>) =>
	render(<MainForm formAction="/" submitButtonText="Submit" {...extraProps} />);

beforeEach(() => {
	// Ensure that the mocked recaptcha script is loaded before each test.
	// The whole grecaptcha object is then mocked in the test setup file, as if the script had really loaded.
	// It will cause the useRecaptcha hook to error, unless the grecaptcha methods are also mocked.
	// An example of mocking the methods to feign success can be found in this test which is part of the suite:
	//  "submits the form when the reCAPTCHA validation check is successful"
	setupRecaptchaScriptMutationObserver();
	setupRecaptchaObject();
});

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
		'This service is protected by reCAPTCHA and the Google',
		{ exact: false },
	);
	await waitFor(() => {
		expect(terms).toBeNull();
	});
});

test('renders the reCAPTCHA terms and conditions when recaptchaSiteKey is defined', async () => {
	const { queryByText } = setup({ recaptchaSiteKey: 'invalid-key' });
	const terms = queryByText(
		'This service is protected by reCAPTCHA and the Google',
		{ exact: false },
	);
	await waitFor(() => {
		expect(terms).toBeInTheDocument();
	});
});

test('calls method to set an error message when reCAPTCHA does not load correctly', async () => {
	const setRecaptchaErrorMessage = jest.fn();
	setup({
		recaptchaSiteKey: 'invalid-key',
		setRecaptchaErrorMessage,
	});
	await waitFor(() => {
		expect(setRecaptchaErrorMessage).toHaveBeenCalledWith(
			'Google reCAPTCHA verification failed.',
		);
	});
});

test('calls the form submit override method if defined', async () => {
	const mockedSubmitOverride = jest.fn();
	const { findByText } = setup({
		onSubmit: mockedSubmitOverride,
		recaptchaSiteKey: 'invalid-key',
	});

	const submitButton = await findByText('Submit');

	await waitFor(() => {
		expect(mockedSubmitOverride).toBeCalledTimes(0);
	});

	void act(() => {
		fireEvent.click(submitButton);
	});

	await waitFor(() => {
		expect(mockedSubmitOverride).toBeCalledTimes(1);
	});
});

test('disables the form submit button when disableOnSubmit is set', async () => {
	const { findByText } = setup({
		disableOnSubmit: true,
		onSubmit: (e) => {
			e.preventDefault(); // Jest does not implement form submit, so we make sure to preventDefault here.
			return { errorOccurred: false };
		},
	});

	const submitButton = await findByText('Submit');

	expect(submitButton).not.toBeDisabled();

	void act(() => {
		fireEvent.click(submitButton);
	});

	await waitFor(() => {
		expect(submitButton).toBeDisabled();
	});
});

test('enables the form submit button when onSubmit returns an error state', async () => {
	const { findByText } = setup({
		disableOnSubmit: true,
		onSubmit: (e) => {
			e.preventDefault(); // Jest does not implement form submit, so we make sure to preventDefault here.
			return { errorOccurred: true };
		},
	});

	const submitButton = await findByText('Submit');

	expect(submitButton).not.toBeDisabled();

	void act(() => {
		fireEvent.click(submitButton);
	});

	await waitFor(() => {
		expect(submitButton).not.toBeDisabled();
	});
});

test('sets error message and context and prevents form submission when the reCAPTCHA check is unsuccessful', async () => {
	// Extend the mocked Google Recaptcha object so that the success callback is called with a valid token.
	const windowSpy = jest.spyOn(global.window, 'grecaptcha', 'get');
	const mockedGrecaptchaRender = jest.fn().mockReturnValue(0);
	const mockedGrecaptchaReset = jest.fn();
	const mockedGrecaptchaReady = jest.fn((callback) => callback());

	// Mock Google Recaptcha calling the success callback with a valid token.
	const mockedGrecaptchaExecute = jest.fn(() => {
		const renderOptions: RenderOptions =
			mockedGrecaptchaRender.mock.calls[0][1];
		// Simulate the error callback being called after the recaptcha check.
		setTimeout(() => {
			renderOptions['error-callback'](undefined);
		}, 10);
	});

	const setRecaptchaErrorMessage = jest.fn();
	const setRecaptchaErrorContext = jest.fn();

	const mockedFormSubmit = jest.fn();
	// eslint-disable-next-line functional/immutable-data
	Object.defineProperty(window.HTMLFormElement.prototype, 'submit', {
		value: mockedFormSubmit,
	});

	const { findByText } = setup({
		recaptchaSiteKey: 'public-recaptcha-token',
		setRecaptchaErrorMessage,
		setRecaptchaErrorContext,
		disableOnSubmit: true,
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

	expect(submitButton).not.toBeDisabled();

	void act(() => {
		fireEvent.click(submitButton);
	});

	// Check that a recaptcha check has been requested.
	await waitFor(() => {
		expect(submitButton).toBeDisabled();

		expect(mockedGrecaptchaReset).toHaveBeenCalledTimes(1);
		expect(mockedGrecaptchaExecute).toHaveBeenCalledTimes(1);
		// Check form is not submitted.
		expect(mockedFormSubmit).toHaveBeenCalledTimes(0);
	});

	// Check that initial error message is shown.
	await waitFor(() => {
		// Ensure that the submit button is re-enabled if the recaptcha check fails.
		expect(submitButton).not.toBeDisabled();

		expect(setRecaptchaErrorMessage).toBeCalledTimes(1);
		expect(setRecaptchaErrorMessage).toHaveBeenCalledWith(
			'Google reCAPTCHA verification failed.',
		);
		expect(setRecaptchaErrorContext).toBeCalledTimes(1);
		expect(setRecaptchaErrorContext).toHaveBeenCalledWith(
			expect.objectContaining({ type: DetailedRecaptchaError }),
		);
	});

	void act(() => {
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
		expect(setRecaptchaErrorContext).toBeCalledTimes(2);
		expect(setRecaptchaErrorContext).toHaveBeenCalledWith(
			expect.objectContaining({ type: DetailedRecaptchaError }),
		);
		// Check form is not submitted.
		expect(mockedFormSubmit).toHaveBeenCalledTimes(0);
	});

	windowSpy.mockRestore();
});

test('submits the form when the reCAPTCHA validation check is successful', async () => {
	// Extend the mocked Google Recaptcha object so that the success callback is called with a valid token.
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
	// eslint-disable-next-line functional/immutable-data
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

	void act(() => {
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

test('Shows an error inside the form when formError is set', async () => {
	const errorText = 'Alas, poor Yorick, an error has occurred.';
	const { queryByText } = setup({ formErrorMessageFromParent: errorText });
	await waitFor(() => {
		expect(queryByText(errorText, { exact: false })).toBeInTheDocument();
	});
});
