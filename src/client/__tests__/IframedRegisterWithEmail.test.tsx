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

describe('geolocation-based newsletter selection', () => {
	test('shows US newsletter bundle for US geolocation', () => {
		setup({
			queryParams: {
				returnUrl: 'https://www.theguardian.com/us',
				appClientId: 'maj',
			},
			geolocation: 'US',
		});

		expect(
			screen.getByText('First Thing and Saturday Edition newsletters', {
				exact: false,
			}),
		).toBeInTheDocument();
	});

	test('shows AU newsletter bundle for AU geolocation', () => {
		setup({
			queryParams: {
				returnUrl: 'https://www.theguardian.com/au',
				appClientId: 'maj',
			},
			geolocation: 'AU',
		});

		expect(
			screen.getByText('Saturday newsletters', {
				exact: false,
			}),
		).toBeInTheDocument();
	});

	test('shows Saturday Edition for GB geolocation', () => {
		setup({
			queryParams: {
				returnUrl: 'https://www.theguardian.com/uk',
				appClientId: 'maj',
			},
			geolocation: 'GB',
		});

		expect(
			screen.getByText('Saturday Edition newsletter', {
				exact: false,
			}),
		).toBeInTheDocument();
	});

	test('shows Saturday Edition for EU geolocation', () => {
		setup({
			queryParams: {
				returnUrl: 'https://www.theguardian.com/eu',
				appClientId: 'maj',
			},
			geolocation: 'EU',
		});

		expect(
			screen.getByText('Saturday Edition newsletter', {
				exact: false,
			}),
		).toBeInTheDocument();
	});

	test('shows Saturday Edition for ROW (rest of world) geolocation', () => {
		setup({
			queryParams: {
				returnUrl: 'https://www.theguardian.com',
				appClientId: 'maj',
			},
			geolocation: 'ROW',
		});

		expect(
			screen.getByText('Saturday Edition newsletter', {
				exact: false,
			}),
		).toBeInTheDocument();
	});

	test('shows Saturday Edition when geolocation is undefined', () => {
		setup({
			queryParams: {
				returnUrl: 'https://www.theguardian.com',
				appClientId: 'maj',
			},
			geolocation: undefined,
		});

		expect(
			screen.getByText('Saturday Edition newsletter', {
				exact: false,
			}),
		).toBeInTheDocument();
	});

	test('does not show newsletter consent outside multiple account flow', () => {
		setup({
			queryParams: {
				returnUrl: 'https://www.theguardian.com/uk',
			},
			geolocation: 'US',
		});

		expect(
			screen.queryByText('First Thing and Saturday Edition newsletters', {
				exact: false,
			}),
		).not.toBeInTheDocument();
		expect(
			screen.queryByText('Saturday Edition newsletter', {
				exact: false,
			}),
		).not.toBeInTheDocument();
	});

	describe('should never show feast or jobs newsletters in iframe flow', () => {
		test('does not show Feast newsletter (appName never accepted in iframe)', () => {
			setup({
				queryParams: {
					returnUrl: 'https://www.theguardian.com/uk',
					appClientId: 'maj',
				},
				geolocation: 'GB',
			});

			expect(
				screen.queryByText(
					'A weekly email from Yotam Ottolenghi, Meera Sodha, Felicity Cloake and Rachel Roddy',
					{ exact: false },
				),
			).not.toBeInTheDocument();

			expect(
				screen.getByText('Saturday Edition newsletter', {
					exact: false,
				}),
			).toBeInTheDocument();
		});

		test('does not show Jobs newsletter in iframe flow', () => {
			setup({
				queryParams: {
					returnUrl: 'https://www.theguardian.com/uk',
					appClientId: 'maj',
				},
				geolocation: 'US',
			});

			expect(
				screen.queryByText(
					'Find your next job with the Guardian Jobs weekly email',
					{ exact: false },
				),
			).not.toBeInTheDocument();

			expect(
				screen.getByText('First Thing and Saturday Edition newsletters', {
					exact: false,
				}),
			).toBeInTheDocument();
		});
	});
});
