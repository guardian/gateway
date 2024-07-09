/// <reference types="cypress" />

import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Password set/create flow', () => {
	beforeEach(() => {
		cy.mockPurge();
	});

	context('A11y checks', () => {
		it('Has no detectable a11y violations on resend password page', () => {
			cy.mockNext(500, {
				status: 'error',
				errors: [
					{
						message: 'Invalid token',
					},
				],
			});
			cy.visit('/set-password/fake_token');
			injectAndCheckAxe();
		});

		it('Has no detectable a11y violations on create/set password page', () => {
			cy.mockNext(200);
			cy.mockNext(200);
			cy.visit('/set-password/fake_token');
			injectAndCheckAxe();
		});

		it('Has no detectable a11y violations on create/set password page with error', () => {
			cy.mockNext(200);
			cy.visit('/set-password/fake_token');
			cy.get('input[name="password"]').type('short');
			cy.get('button[type="submit"]').click();
			injectAndCheckAxe();
		});

		it('Has no detectable a11y violations on create/set password complete page', () => {
			cy.mockNext(200);
			cy.mockNext(200);
			cy.intercept({
				method: 'GET',
				url: 'https://api.pwnedpasswords.com/range/*',
			}).as('breachCheck');
			cy.visit('/set-password/fake_token');
			cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
			cy.wait('@breachCheck');
			cy.get('button[type="submit"]').click();
			injectAndCheckAxe();
		});
	});

	context('show / hide password eye button', () => {
		it('clicking on the password eye shows the password and clicking it again hides it', () => {
			cy.mockNext(200);
			cy.visit('/set-password/fake_token');
			cy.get('input[name="password"]').should('have.attr', 'type', 'password');
			cy.get('input[name="password"]').type('some_password');
			cy.get('[data-cy=password-input-eye-button]').click();
			cy.get('input[name="password"]').should('have.attr', 'type', 'text');
			cy.get('[data-cy=password-input-eye-button]').click();
			cy.get('input[name="password"]').should('have.attr', 'type', 'password');
		});
	});

	context('An expired/invalid token is used', () => {
		it('shows a resend password page', () => {
			cy.mockNext(500, {
				status: 'error',
				errors: [
					{
						message: 'Invalid token',
					},
				],
			});
			cy.visit('/set-password/fake_token');
			cy.contains('This link has expired');
		});

		it('does not allow email resend if reCAPTCHA check fails', () => {
			cy.mockNext(500, {
				status: 'error',
				errors: [
					{
						message: 'Invalid token',
					},
				],
			});
			cy.visit('/set-password/fake_token');
			cy.contains('This link has expired');
			cy.get('input[name="email"]').type('some@email.com');
			cy.intercept('POST', 'https://www.google.com/recaptcha/api2/**', {
				statusCode: 500,
			});
			cy.get('button[type="submit"]').click();
			cy.contains('Google reCAPTCHA verification failed.');
			cy.contains('If the problem persists please try the following:');
		});
	});

	context('General IDAPI failure on token read', () => {
		it('displays the password resend page', () => {
			cy.mockNext(500);
			cy.visit('/set-password/fake_token');
			cy.contains('This link has expired');
		});
	});

	context('General IDAPI failure on password change', () => {
		it('displays a generic error message', () => {
			cy.mockNext(200);
			cy.mockNext(500);
			cy.mockNext(200);
			cy.intercept({
				method: 'GET',
				url: 'https://api.pwnedpasswords.com/range/*',
			}).as('breachCheck');
			cy.visit('/set-password/fake_token');
			cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
			cy.wait('@breachCheck');
			cy.get('button[type="submit"]').click();
			cy.contains(
				'There was a problem changing your password, please try again.',
			);
		});
	});
});
