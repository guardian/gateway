import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Sign in flow', () => {
	beforeEach(() => {
		cy.mockPurge();
	});

	context('A11y checks', () => {
		it('Has no detectable a11y violations on sign in page', () => {
			cy.visit('/signin?useIdapi=true');
			injectAndCheckAxe();
		});

		it('Has no detectable a11y violations on sign in page with error', () => {
			cy.visit('/signin?useIdapi=true');
			cy.get('input[name="email"]').type('Invalid email');
			cy.get('input[name="password"]').type('Invalid password');
			cy.mockNext(500);
			cy.get('[data-cy=main-form-submit-button]').click();
			injectAndCheckAxe();
		});
	});

	context('Signing in', () => {
		const defaultReturnUrl = 'https://m.code.dev-theguardian.com';
		it('shows an error message when sign in fails', function () {
			cy.visit(
				'/signin?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout&useIdapi=true',
			);
			cy.get('input[name="email"]').type('example@example.com');
			cy.get('input[name="password"]').type('password');
			cy.mockNext(403, {
				status: 'error',
				errors: [
					{
						message: 'Invalid email or password',
					},
				],
			});
			cy.get('[data-cy=main-form-submit-button]').click();
			cy.contains("Email and password don't match");
			cy.get('input[name="email"]').should('have.value', 'example@example.com');
		});

		it('shows a generic error message when the api error response is not known', function () {
			cy.visit(
				'/signin?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout&useIdapi=true',
			);
			cy.get('input[name="email"]').type('example@example.com');
			cy.get('input[name="password"]').type('password');
			cy.mockNext(403, {
				status: 'error',
				errors: [
					{
						message: 'Bloopity flub',
					},
				],
			});
			cy.get('[data-cy=main-form-submit-button]').click();
			cy.contains('There was a problem signing in, please try again');
		});

		it('loads the returnUrl upon successful authentication', function () {
			const returnUrl = 'https://www.theguardian.com/about';
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', returnUrl, (req) => {
				req.reply(200);
			});
			cy.visit(
				`/signin?returnUrl=${encodeURIComponent(returnUrl)}&useIdapi=true`,
			);
			cy.get('input[name="email"]').type('example@example.com');
			cy.get('input[name="password"]').type('password');
			cy.mockNext(200, {
				cookies: {
					values: [{ key: 'key', value: 'value' }],
					expiresAt: new Date(Date.now() + 1800000 /* 30min */).toISOString(),
				},
			});
			cy.get('[data-cy=main-form-submit-button]').click();
			cy.url().should('eq', returnUrl);
		});

		it('redirects to the default url if no returnUrl given', function () {
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
				req.reply(200);
			});

			cy.visit('/signin?useIdapi=true');
			cy.get('input[name="email"]').type('example@example.com');
			cy.get('input[name="password"]').type('password');
			cy.mockNext(200, {
				cookies: {
					values: [{ key: 'key', value: 'value' }],
					expiresAt: new Date(Date.now() + 1800000 /* 30min */).toISOString(),
				},
			});
			cy.get('[data-cy=main-form-submit-button]').click();
			cy.url().should('include', defaultReturnUrl);
		});

		it('auto-fills the email field when encryptedEmail is successfully decrypted', () => {
			cy.mockNext(200, {
				status: 'ok',
				email: 'test@test.com',
			});
			cy.visit(`/signin?encryptedEmail=bdfalrbagbgu&useIdapi=true`);
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
				'/signin?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout&useIdapi=true',
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

		it('redirects to homepage when user with existing valid session visits signin page', () => {
			cy.setCookie('SC_GU_U', 'sessionvalue');
			cy.setCookie('SC_GU_LA', 'la_value');

			cy.request({
				url: '/signin',
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

		it('redirects to /reauthenticate when user with existing invalid session visits signin page', () => {
			cy.setCookie('SC_GU_U', 'sessionvalue');
			cy.setCookie('SC_GU_LA', 'la_value');

			cy.mockNext(200, {
				status: 'signedInNotRecently',
				emailValidated: true,
			});
			cy.visit('/signin?useIdapi=true');

			cy.location('pathname').should('eq', '/reauthenticate');
		});
	});

	context('General IDAPI failure', () => {
		it('displays a generic error message', function () {
			cy.mockNext(500);
			cy.visit(
				'/signin?returnUrl=https%3A%2F%2Flocalhost%3A8861%2Fsignin&useIdapi=true',
			);
			cy.get('input[name="email"]').type('example@example.com');
			cy.get('input[name="password"]').type('password');
			cy.get('[data-cy=main-form-submit-button]').click();
			cy.contains('There was a problem signing in, please try again');
		});
	});
});
