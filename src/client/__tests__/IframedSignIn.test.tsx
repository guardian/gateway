/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import { IframedSignIn, IframedSignInProps } from '../pages/IframedSignIn';
import { SignInErrors } from '@/shared/model/Errors';

const baseProps: IframedSignInProps = {
	recaptchaSiteKey: '',
	queryParams: {
		returnUrl: 'https://www.theguardian.com/uk',
	},
};

const setup = (extraProps?: Partial<IframedSignInProps>) =>
	render(<IframedSignIn {...baseProps} {...extraProps} />);

const guardianTermsText =
	'For more information about how we use your data, including the generation of random identifiers';

test('shows social auth buttons and GuardianTerms when social buttons are visible', () => {
	setup();

	expect(screen.getByText('Continue with Google')).toBeInTheDocument();
	expect(screen.getByText('Continue with Apple')).toBeInTheDocument();
	expect(
		screen.getByText(guardianTermsText, { exact: false }),
	).toBeInTheDocument();
});

test('shows GuardianTerms for multiple account flow when social buttons are hidden', () => {
	setup({
		hideSocialButtons: true,
		queryParams: {
			returnUrl: 'https://www.theguardian.com/uk',
			appClientId: 'maj',
		},
	});

	expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument();
	expect(screen.queryByText('Continue with Apple')).not.toBeInTheDocument();
	expect(
		screen.getByText(guardianTermsText, { exact: false }),
	).toBeInTheDocument();
});

test('shows GuardianTerms for multiple account flow when social buttons are hidden even if social sign-in is blocked', () => {
	setup({
		hideSocialButtons: true,
		pageError: SignInErrors.SOCIAL_SIGNIN_ERROR,
		queryParams: {
			returnUrl: 'https://www.theguardian.com/uk',
			appClientId: 'maj',
		},
	});

	expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument();
	expect(screen.queryByText('Continue with Apple')).not.toBeInTheDocument();
	expect(
		screen.getAllByText(guardianTermsText, { exact: false }).length,
	).toBeGreaterThan(0);
});

test('does not show GuardianTerms when social buttons are hidden outside multiple account flow', () => {
	setup({ hideSocialButtons: true });

	expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument();
	expect(screen.queryByText('Continue with Apple')).not.toBeInTheDocument();
	expect(
		screen.queryByText(guardianTermsText, { exact: false }),
	).not.toBeInTheDocument();
});
