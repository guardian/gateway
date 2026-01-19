import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Registration flow', () => {
	beforeEach(() => {
		cy.mockPurge();
		cy.intercept('GET', 'https://ophan.theguardian.com/**', {
			statusCode: 204,
			body: {},
		});
	});

	context('A11y checks', () => {
		it('Has no detectable a11y violations on registration page', () => {
			cy.visit('/register');
			injectAndCheckAxe();
			cy.visit('/register/email');
			injectAndCheckAxe();
		});

		it('Has no detectable a11y violations on registration page with error', () => {
			cy.visit('/register/email');
			cy.get('input[name="email"]').type('Invalid email');
			cy.mockNext(500);
			cy.get('[data-cy=main-form-submit-button]').click();
			injectAndCheckAxe();
		});
	});

	context('Registering', () => {
		it('shows recaptcha error message when reCAPTCHA token request fails', () => {
			cy.visit(
				'/register/email?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout',
			);
			cy.get('input[name="email"]').type('placeholder@example.com');
			cy.intercept('POST', 'https://www.google.com/recaptcha/api2/**', {
				statusCode: 500,
			});
			cy.get('[data-cy=main-form-submit-button]').click();
			cy.contains('Google reCAPTCHA verification failed.');
			cy.contains('If the problem persists please try the following:');
		});
	});

	context('General IDAPI failure', () => {
		it('displays a generic error message', function () {
			cy.mockNext(500);
			cy.visit(
				'/register/email?returnUrl=https%3A%2F%2Flocalhost%3A8861%2Fsignin',
			);

			cy.get('input[name=email]').type('example@example.com');
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('There was a problem registering, please try again.');
		});
	});
});
