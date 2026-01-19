/**
 * @jest-environment jsdom
 */
import { render, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import { SignIn, SignInProps } from '../pages/SignIn';

const setup = (extraProps?: Partial<SignInProps>) =>
	render(
		<SignIn
			recaptchaSiteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
			isReauthenticate={false}
			queryParams={{
				returnUrl: 'https://www.theguardian.com/uk',
			}}
			{...extraProps}
		/>,
	);

test('Register button not shown when reauthenticate is set to true', async () => {
	const { queryByText } = setup({ isReauthenticate: true });
	await waitFor(() => {
		// This may need to be made a bit more specific if we ever put the word
		// 'Register' on the page but it works for the moment!
		expect(queryByText('Register')).not.toBeInTheDocument();
	});
});

test('Shows an error inside the form when formError is set', async () => {
	const errorText = 'Alas, poor Yorick, an error has occurred.';
	const { getByTestId } = setup({
		formError: errorText,
	});
	const mainForm = getByTestId('main-form');
	const formError = within(mainForm).queryByText(errorText, { exact: false });
	await waitFor(() => {
		expect(formError).toBeInTheDocument();
	});
});

test('Shows an error outside the form when pageError is set', async () => {
	const errorText = 'Alas, poor Yorick, an error has occurred.';
	const { getByTestId, queryByText } = setup({
		pageError: errorText,
	});
	const mainForm = getByTestId('main-form');
	const formError = within(mainForm).queryByText(errorText, { exact: false });
	await waitFor(() => {
		expect(formError).not.toBeInTheDocument();
		expect(queryByText(errorText)).toBeInTheDocument();
	});
});
