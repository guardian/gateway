/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';

import { EmailInput } from '../components/EmailInput';

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

test('errors with nothing submitted', () => {
	const { emailInput, queryByText } = setup();
	// Input empty text to trigger error
	fireEvent.input(emailInput, { target: { value: '' } });
	expect(emailInput.value).toEqual('');

	// Check error message
	const error = queryByText('Please enter your email.');
	expect(error).toBeInTheDocument();
});

// test doesn't seem to work with @testing-library/preact
// despite the fact that it works in the browser, cypress, and storybook
// and used to work with @testing-library/react
test.skip('errors with an invalid email', () => {
	const { emailInput, queryByText } = setup();
	// Input text and blur to trigger error
	fireEvent.change(emailInput, { target: { value: 'invalid.email.com' } });
	fireEvent.blur(emailInput);
	expect(emailInput.value).toEqual('invalid.email.com');

	// Check error message
	const error = queryByText('Please enter a valid email format.');
	expect(error).toBeInTheDocument();
});

test('does not error with a valid email', () => {
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

// test doesn't seem to work with @testing-library/preact
// despite the fact that it works in the browser, cypress, and storybook
// and used to work with @testing-library/react
test.skip('error is corrected once a valid email is submitted', () => {
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
