import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Password change flow', () => {
	const fakeValidationResponse = (
		timeUntilExpiry: number | undefined = undefined,
	) => ({
		user: {
			primaryEmailAddress: 'name@example.com',
		},
		timeUntilExpiry,
	});

	const fakeSuccessResponse = {
		cookies: {
			values: [
				{
					key: 'GU_U',
					value: 'FAKE_VALUE_0',
				},
				{
					key: 'SC_GU_LA',
					value: 'FAKE_VALUE_1',
					sessionCookie: true,
				},
				{
					key: 'SC_GU_U',
					value: 'FAKE_VALUE_2',
				},
			],
			expiresAt: 1,
		},
	};

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
			cy.visit(`/reset-password/fake_token?useIdapi=true`);
			injectAndCheckAxe();
		});

		it('Has no detectable a11y violations on change password page', () => {
			cy.mockNext(200);
			cy.mockNext(200, fakeSuccessResponse);
			cy.visit(`/reset-password/fake_token?useIdapi=true`);
			injectAndCheckAxe();
		});

		it('Has no detectable a11y violations on change password page with error', () => {
			cy.mockNext(200);
			cy.visit(`/reset-password/fake_token?useIdapi=true`);
			cy.get('input[name="password"]').type('short');
			cy.get('button[type="submit"]').click();
			injectAndCheckAxe();
		});

		it('Has no detectable a11y violations on change password complete page', () => {
			cy.mockNext(200);
			cy.mockNext(200, fakeSuccessResponse);
			cy.intercept({
				method: 'GET',
				url: 'https://api.pwnedpasswords.com/range/*',
			}).as('breachCheck');
			cy.visit(`/reset-password/fake_token?useIdapi=true`);
			cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
			cy.wait('@breachCheck');
			cy.get('button[type="submit"]').click();
			injectAndCheckAxe();
		});
	});

	context('show / hide password eye button', () => {
		it('clicking on the password eye shows the password and clicking it again hides it', () => {
			cy.mockNext(200);
			cy.visit(`/reset-password/fake_token?useIdapi=true`);
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
			cy.visit(`/reset-password/fake_token?useIdapi=true`);
			cy.contains('Link expired');
		});

		it('shows the session time out page if the token expires while on the set password page', () => {
			cy.mockNext(200, fakeValidationResponse(1000));
			cy.visit(`/reset-password/fake_token?useIdapi=true`);
			cy.contains('Session timed out');
		});
	});

	context('Password exists in breach dataset', () => {
		it('displays a breached error', () => {
			cy.mockNext(200);
			cy.mockNext(200, fakeSuccessResponse);
			cy.intercept({
				method: 'GET',
				url: 'https://api.pwnedpasswords.com/range/*',
			}).as('breachCheck');
			cy.visit(`/reset-password/fake_token?useIdapi=true`);
			cy.get('input[name="password"]').type('password');
			cy.wait('@breachCheck');
			cy.contains('avoid passwords that are easy to guess');
			cy.get('button[type="submit"]').click().should('not.be.disabled');
		});
	});

	context('CSRF token error on submission', () => {
		it('should fail on submission due to CSRF token failure if CSRF token cookie is not sent', () => {
			cy.mockNext(200);
			cy.intercept({
				method: 'GET',
				url: 'https://api.pwnedpasswords.com/range/*',
			}).as('breachCheck');
			cy.visit(`/reset-password/fake_token?useIdapi=true`);
			cy.clearCookie('_csrf');
			cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
			cy.wait('@breachCheck');
			cy.get('button[type="submit"]').click();
			cy.contains('Please try again.');
		});
	});

	context('Password field is left blank', () => {
		it('uses the standard HTML5 empty field validation', () => {
			cy.mockNext(200);
			cy.visit(`/reset-password/fake_token?useIdapi=true`);
			cy.get('button[type="submit"]').click();
			cy.get('input[name="password"]:invalid').should('have.length', 1);
		});
	});

	context('Email shown on page', () => {
		it('shows the users email address on the page', () => {
			cy.mockNext(200, fakeValidationResponse());
			cy.visit(`/reset-password/fake_token?useIdapi=true`);
			cy.contains(fakeValidationResponse().user.primaryEmailAddress);
		});
	});

	context('Valid password entered', () => {
		it('shows password change success screen, with a default return url', () => {
			cy.mockNext(200);
			cy.mockNext(200, fakeSuccessResponse);
			cy.intercept({
				method: 'GET',
				url: 'https://api.pwnedpasswords.com/range/*',
			}).as('breachCheck');
			cy.visit(`/reset-password/fake_token?useIdapi=true`);

			cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
			cy.wait('@breachCheck');
			// Submit the button
			cy.contains('Strong password required');
			cy.get('button[type="submit"]').click();
			cy.contains('Sign in');
			cy.url().should(
				'include',
				`returnUrl=https%3A%2F%2Fm.code.dev-theguardian.com`,
			);
			cy.url().should('not.include', 'useIdapi=true');

			// Not currently possible to test login cookie,
			// Cookie is not set to domain we can access, even in cypress.
			// e.g.
			// cy.getCookie('GU_U')
			//  .should('have.property', 'value', 'FAKE_VALUE_0');
		});
	});

	context(
		'Valid password entered and a return url with a Guardian domain is specified.',
		() => {
			it('shows password change success screen, with a redirect button linking to the return url.', () => {
				cy.mockNext(200);
				cy.mockNext(200, fakeSuccessResponse);
				cy.intercept({
					method: 'GET',
					url: 'https://api.pwnedpasswords.com/range/*',
				}).as('breachCheck');
				cy.visit(
					`/reset-password/fake_token?returnUrl=https://news.theguardian.com&useIdapi=true`,
				);
				cy.get('input[name="password"]').type(
					'thisisalongandunbreachedpassword',
				);
				cy.wait('@breachCheck');
				cy.get('button[type="submit"]').click();
				cy.contains('Sign in');
				cy.url().should(
					'include',
					`returnUrl=${encodeURIComponent('https://news.theguardian.com')}`,
				);
				cy.url().should('not.include', 'useIdapi=true');
			});
		},
	);

	context(
		'Valid password entered and an return url from a non-Guardian domain is specified.',
		() => {
			it('shows password change success screen, with a default redirect button.', () => {
				cy.mockNext(200);
				cy.mockNext(200, fakeSuccessResponse);
				cy.intercept({
					method: 'GET',
					url: 'https://api.pwnedpasswords.com/range/*',
				}).as('breachCheck');
				cy.visit(
					`/reset-password/fake_token?returnUrl=https://news.badsite.com&useIdapi=true`,
				);
				cy.get('input[name="password"]').type(
					'thisisalongandunbreachedpassword',
				);
				cy.wait('@breachCheck');
				cy.get('button[type="submit"]').click();
				cy.contains('Sign in');
				cy.url().should(
					'include',
					`returnUrl=https%3A%2F%2Fm.code.dev-theguardian.com`,
				);
				cy.url().should('not.include', 'useIdapi=true');
			});
		},
	);

	context('password too short', () => {
		it('shows an error showing the password length must be within certain limits', () => {
			cy.mockNext(200);
			cy.visit(`/reset-password/fake_token?useIdapi=true`);
			cy.mockNext(200);
			cy.get('input[name="password"]').type('p');
			cy.get('button[type="submit"]').focus();
			// Error is shown before clicking submit
			cy.contains('At least 8');
			cy.get('button[type="submit"]').click();
			// Error still exists after clicking submit
			cy.contains(
				'Please make sure your password is at least 8 characters long.',
			);
			cy.intercept({
				method: 'GET',
				url: 'https://api.pwnedpasswords.com/range/*',
			}).as('breachCheck');
			cy.get('input[name="password"]').type('iamaveryuniqueandlongstring');
			cy.wait('@breachCheck');
			cy.contains('Strong password required');
		});
	});

	context('password too long', () => {
		it('shows an error showing the password length must be within certain limits', () => {
			const excessivelyLongPassword = Array.from(Array(73), () => 'a').join('');
			cy.mockNext(200);
			cy.intercept({
				method: 'GET',
				url: 'https://api.pwnedpasswords.com/range/*',
			}).as('breachCheck');
			cy.visit(`/reset-password/fake_token?useIdapi=true`);
			cy.mockNext(200);
			cy.get('input[name="password"]').type(excessivelyLongPassword);
			cy.get('button[type="submit"]').focus();
			// Error is shown before clicking submit
			cy.contains('Maximum of 72');
			cy.wait('@breachCheck');
			cy.get('button[type="submit"]').click();
			// Error still exists after clicking submit
			cy.contains(
				'Please make sure your password is not longer than 72 characters.',
			);
			cy.get('input[name="password"]').type(
				'{selectall}{backspace}iamaveryuniqueandlongstring',
			);
			cy.wait('@breachCheck');
			cy.contains('Strong password required');
		});
	});

	context('General IDAPI failure on token read', () => {
		it('displays the password resend page', () => {
			cy.mockNext(500);
			cy.visit(`/reset-password/fake_token?useIdapi=true`);
			cy.contains('Link expired');
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
			cy.visit(`/reset-password/fake_token?useIdapi=true`);
			cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
			cy.wait('@breachCheck');
			cy.get('button[type="submit"]').click();
			cy.contains(
				'There was a problem changing your password, please try again.',
			);
		});
	});
});
