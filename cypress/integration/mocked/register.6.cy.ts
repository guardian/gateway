import { injectAndCheckAxe } from '../../support/cypress-axe';
import { invalidEmailAddress } from '../../support/idapi/guest';

describe('Registration flow', () => {
	beforeEach(() => {
		cy.mockPurge();
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
		it('shows a generic error message when registration fails', () => {
			cy.visit(
				'/register/email?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout',
			);
			cy.get('input[name="email"]').type('example@example.com');
			cy.mockNext(200, {
				userType: 'new',
			});
			cy.mockNext(403, {
				status: 'error',
				errors: [
					{
						message: '',
					},
				],
			});
			cy.get('[data-cy=main-form-submit-button]').click();
			cy.contains('There was a problem registering, please try again.');
		});

		it('shows a email field error message when no email is sent', () => {
			cy.visit(
				'/register/email?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout',
			);
			cy.get('input[name="email"]').type('placeholder@example.com');
			cy.mockNext(200, {
				userType: 'new',
			});
			cy.mockNext(400, invalidEmailAddress);
			cy.get('[data-cy=main-form-submit-button]').click();
			cy.contains('Please enter a valid email address.');
		});

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

		it('redirects to email sent page upon successful guest registration', () => {
			cy.visit(
				'/register/email?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout',
			);
			cy.get('input[name="email"]').type('example@example.com');
			cy.mockNext(200, {
				userType: 'new',
			});
			cy.mockNext(200, {
				status: 'success',
				errors: [],
			});
			cy.get('[data-cy=main-form-submit-button]').click();
			cy.contains('Check your inbox');
			cy.contains('example@example.com');
		});

		it('redirects to email sent page when existing user with password attempts to register', () => {
			cy.visit(
				'/register/email?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout',
			);
			cy.get('input[name="email"]').type('example@example.com');
			cy.mockNext(200, {
				userType: 'current',
			});
			cy.mockNext(200);
			cy.get('[data-cy=main-form-submit-button]').click();
			cy.contains('Check your inbox');
			cy.contains('example@example.com');
		});

		it('redirects to email sent page when existing user without password attempts to register', () => {
			cy.visit(
				'/register/email?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout',
			);
			cy.get('input[name="email"]').type('example@example.com');
			cy.mockNext(200, {
				userType: 'guest',
			});
			cy.mockNext(200);
			cy.get('[data-cy=main-form-submit-button]').click();
			cy.contains('Check your inbox');
			cy.contains('example@example.com');
		});

		it('redirects to homepage when user with existing valid session visits register page', () => {
			cy.setCookie('SC_GU_U', 'sessionvalue');
			cy.setCookie('SC_GU_LA', 'la_value');

			cy.request({
				url: '/register',
				followRedirect: false,
				failOnStatusCode: false,
			}).then((response) => {
				expect(response.status).to.eq(302);
				expect(response.redirectedToUrl).to.eq(
					'https://m.code.dev-theguardian.com/',
				);
			});
			cy.mockNext(200, {
				status: 'signedInRecently',
				emailValidated: true,
			});
		});
		it('redirects to /reauthenticate when user with existing invalid session visits register page', () => {
			cy.setCookie('SC_GU_U', 'sessionvalue');
			cy.setCookie('SC_GU_LA', 'la_value');

			cy.mockNext(200, {
				status: 'signedInNotRecently',
				emailValidated: true,
			});
			cy.visit('/register');

			cy.location('pathname').should('eq', '/reauthenticate');
		});
	});

	context('General IDAPI failure', () => {
		it('displays a generic error message', function () {
			cy.mockNext(200, {
				userType: 'new',
			});
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
