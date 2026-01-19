import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Sign in flow', () => {
	beforeEach(() => {
		cy.mockPurge();
		cy.intercept('GET', 'https://ophan.theguardian.com/**', {
			statusCode: 204,
			body: {},
		});
	});

	context('A11y checks', () => {
		it('Has no detectable a11y violations on sign in page', () => {
			cy.visit('/signin?usePasswordSignIn=true');
			injectAndCheckAxe();
		});

		it('Has no detectable a11y violations on sign in page with error', () => {
			cy.visit('/signin?usePasswordSignIn=true');
			cy.get('input[name="email"]').type('Invalid email');
			cy.get('input[name="password"]').type('Invalid password');
			cy.mockNext(500);
			cy.get('[data-cy=main-form-submit-button]').click();
			injectAndCheckAxe();
		});
	});

	context('Signing in', () => {
		it('auto-fills the email field when encryptedEmail is successfully decrypted', () => {
			cy.mockNext(200, {
				status: 'ok',
				email: 'test@test.com',
			});
			cy.visit(`/signin?encryptedEmail=bdfalrbagbgu`);
			cy.get('input[name="email"]').should('have.value', 'test@test.com');
		});

		it('shows recaptcha error message when reCAPTCHA token request fails', () => {
			// Intercept "Report this error" link because we just check it is linked to.
			cy.intercept(
				'GET',
				'https://manage.theguardian.com/help-centre/contact-us',
				{
					statusCode: 200,
				},
			);
			cy.visit(
				'/signin?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout&usePasswordSignIn=true',
			);
			cy.get('input[name="email"]').type('placeholder@example.com');
			cy.get('input[name="password"]').type('definitelynotarealpassword');
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
				'/signin?returnUrl=https%3A%2F%2Flocalhost%3A8861%2Fsignin&usePasswordSignIn=true',
			);
			cy.get('input[name="email"]').type('example@example.com');
			cy.get('input[name="password"]').type('password');
			cy.get('[data-cy=main-form-submit-button]').click();
			cy.contains('There was a problem signing in, please try again');
		});
	});
});
