/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import type { ComponentProps } from 'react';
import { IframedRegisterWithEmail } from '../pages/IframedRegisterWithEmail';

type IframedRegisterWithEmailProps = ComponentProps<
	typeof IframedRegisterWithEmail
>;

const baseProps: IframedRegisterWithEmailProps = {
	recaptchaSiteKey: '',
	queryParams: {
		returnUrl: 'https://www.theguardian.com/uk',
	},
};

const setup = (extraProps?: Partial<IframedRegisterWithEmailProps>) =>
	render(<IframedRegisterWithEmail {...baseProps} {...extraProps} />);

const guardianTermsText =
	'For more information about how we use your data, including the generation of random identifiers';

test('shows GuardianTerms for multiple account flow', () => {
	setup({
		queryParams: {
			returnUrl: 'https://www.theguardian.com/uk',
			appClientId: 'maj',
		},
	});

	expect(
		screen.getByText(guardianTermsText, { exact: false }),
	).toBeInTheDocument();
});

test('does not show GuardianTerms outside multiple account flow', () => {
	setup();

	expect(
		screen.queryByText(guardianTermsText, { exact: false }),
	).not.toBeInTheDocument();
});

test('keeps the iframe register flow email-only even for multiple account flow', () => {
	setup({
		queryParams: {
			returnUrl: 'https://www.theguardian.com/uk',
			appClientId: 'maj',
		},
	});

	expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument();
	expect(screen.queryByText('Continue with Apple')).not.toBeInTheDocument();
});
