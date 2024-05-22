import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Welcome and set password page', () => {
	const defaultEmail = 'someone@theguardian.com';
	const checkTokenSuccessResponse = (
		timeUntilExpiry: number | null = null,
		email = defaultEmail,
	) => ({
		user: {
			primaryEmailAddress: email,
		},
		timeUntilExpiry,
	});

	beforeEach(() => {
		cy.mockPurge();
	});

	context('A11y checks', () => {
		it('has no detectable a11y violations on the set password page', () => {
			cy.mockNext(200, checkTokenSuccessResponse());
			cy.visit(`/welcome/fake_token?useIdapi=true`);
			injectAndCheckAxe();
		});

		it('has no detectable a11y violations on set password page with global error', () => {
			cy.mockNext(200, checkTokenSuccessResponse());
			cy.visit(`/welcome/fake_token?useIdapi=true`);
			cy.mockNext(500);
			cy.get('input[name="password"]').type('short');
			cy.get('button[type="submit"]').click();
			injectAndCheckAxe();
		});

		it('has no detectable a11y violations on the resend page', () => {
			cy.visit(`/welcome/resend?useIdapi=true`);
			injectAndCheckAxe();
		});

		it('has no detectable a11y violations on the resend page with global error', () => {
			cy.visit(`/welcome/resend?useIdapi=true`);

			cy.mockNext(500);
			cy.get('input[name="email"]').type(
				checkTokenSuccessResponse().user.primaryEmailAddress,
			);
			cy.get('button[type="submit"]').click();
			injectAndCheckAxe();
		});

		it('has no detectable a11y violations on the email sent page with resend box', () => {
			cy.visit(`/welcome/resend?useIdapi=true`);

			cy.mockNext(200);
			cy.get('input[name="email"]').type(
				checkTokenSuccessResponse().user.primaryEmailAddress,
			);
			cy.get('button[type="submit"]').click();
			injectAndCheckAxe();
		});

		it('has no detectable a11y violations on the email sent page without resend box', () => {
			cy.visit(`/welcome/email-sent?useIdapi=true`);
			injectAndCheckAxe();
		});
	});

	// successful token, set password page is displayed, redirect to consents flow if valid password
	context('A valid token is used and set password page is displayed', () => {
		it('shows an error if the password is invalid', () => {
			cy.mockNext(200, checkTokenSuccessResponse());
			cy.mockNext(400, {
				status: 'error',
				errors: [
					{
						message: 'Breached password',
					},
				],
			});
			cy.mockNext(200, checkTokenSuccessResponse());
			cy.visit(`/welcome/fake_token?useIdapi=true`);
			cy.get('input[name="password"]').type('password');
			cy.get('button[type="submit"]').click();
			cy.contains('Please use a password that is hard to guess.');
		});

		it('shows prompt to create password', () => {
			cy.mockNext(200, checkTokenSuccessResponse());
			cy.intercept({
				method: 'GET',
				url: 'https://api.pwnedpasswords.com/range/*',
			}).as('breachCheck');
			cy.visit(`/welcome/fake_token?useIdapi=true`);
			cy.contains(`Set a password for Guardian account: ${defaultEmail}`);
		});

		it('shows prompt to create password without email if none exists', () => {
			cy.mockNext(200, checkTokenSuccessResponse(null, ''));
			cy.intercept({
				method: 'GET',
				url: 'https://api.pwnedpasswords.com/range/*',
			}).as('breachCheck');
			cy.visit(`/welcome/fake_token?useIdapi=true`);
			cy.contains(`Set a password for your new account.`);
		});
	});

	context('An expired/invalid token is used', () => {
		it('shows the link expired page to type email, and on submit shows the email sent page, with a button to resend the email', () => {
			cy.mockNext(500, {
				status: 'error',
				errors: [
					{
						message: 'Invalid token',
					},
				],
			});
			cy.mockNext(200);
			cy.mockNext(200);
			cy.visit(`/welcome/fake_token?useIdapi=true`);
			cy.contains('Link expired');
			cy.get('input[name="email"]').type(
				checkTokenSuccessResponse().user.primaryEmailAddress,
			);
			cy.get('button[type="submit"]').click();
			cy.contains('Check your email inbox');
			cy.contains(checkTokenSuccessResponse().user.primaryEmailAddress);
			cy.contains('send again');
		});

		it('shows the session time out page if the token expires while on the set password page', () => {
			cy.mockNext(200, checkTokenSuccessResponse(1000));
			cy.visit(`/welcome/fake_token?useIdapi=true`);
			cy.contains('Session timed out');
		});
	});

	context('Email sent page', () => {
		it('resends email if button exists', () => {
			cy.visit(`/welcome/resend?useIdapi=true`);

			cy.mockNext(200);
			cy.get('input[name="email"]').type(
				checkTokenSuccessResponse().user.primaryEmailAddress,
			);
			cy.get('button[type="submit"]').click();

			cy.mockNext(200);
			cy.contains('Check your email inbox');
			cy.get('button[type="submit"]').click();
			cy.contains('Check your email inbox');
		});

		it('fails to send again if reCAPTCHA check is unsuccessful', () => {
			cy.visit(`/welcome/resend?useIdapi=true`);

			cy.mockNext(200);

			cy.get('input[name="email"]').type(
				checkTokenSuccessResponse().user.primaryEmailAddress,
			);

			cy.intercept('POST', 'https://www.google.com/recaptcha/api2/**', {
				statusCode: 500,
			});
			cy.get('button[type="submit"]').click();
			cy.contains('Google reCAPTCHA verification failed.');
			cy.contains('If the problem persists please try the following:');
		});

		it('takes user back to link expired page if "try another address" clicked', () => {
			cy.visit(`/welcome/resend?useIdapi=true`);

			cy.mockNext(200);
			cy.get('input[name="email"]').type(
				checkTokenSuccessResponse().user.primaryEmailAddress,
			);
			cy.get('button[type="submit"]').click();

			cy.contains('try another address').click();

			cy.contains('Link expired');
		});
	});
});
