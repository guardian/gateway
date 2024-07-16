import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Password change flow', () => {
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
			cy.visit(`/reset-password/fake_token`);
			injectAndCheckAxe();
		});

		it('Has no detectable a11y violations on change password page', () => {
			cy.mockNext(200);
			cy.visit(`/reset-password/fake_token`);
			injectAndCheckAxe();
		});

		it('Has no detectable a11y violations on change password page with error', () => {
			cy.mockNext(200);
			cy.visit(`/reset-password/fake_token`);
			cy.get('input[name="password"]').type('short');
			cy.get('button[type="submit"]').click();
			injectAndCheckAxe();
		});

		it('Has no detectable a11y violations on change password complete page', () => {
			cy.mockNext(200);
			cy.mockNext(200);
			cy.intercept({
				method: 'GET',
				url: 'https://api.pwnedpasswords.com/range/*',
			}).as('breachCheck');
			cy.visit(`/reset-password/fake_token`);
			cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
			cy.wait('@breachCheck');
			cy.get('button[type="submit"]').click();
			injectAndCheckAxe();
		});
	});

	context('show / hide password eye button', () => {
		it('clicking on the password eye shows the password and clicking it again hides it', () => {
			cy.mockNext(200);
			cy.visit(`/reset-password/fake_token`);
			cy.get('input[name="password"]').should('have.attr', 'type', 'password');
			cy.get('input[name="password"]').type('some_password');
			cy.get('[data-cy=password-input-eye-button]').click();
			cy.get('input[name="password"]').should('have.attr', 'type', 'text');
			cy.get('[data-cy=password-input-eye-button]').click();
			cy.get('input[name="password"]').should('have.attr', 'type', 'password');
		});
	});

	context('Password exists in breach dataset', () => {
		it('displays a breached error', () => {
			cy.mockNext(200);
			cy.mockNext(200);
			cy.intercept({
				method: 'GET',
				url: 'https://api.pwnedpasswords.com/range/*',
			}).as('breachCheck');
			cy.visit(`/reset-password/fake_token`);
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
			cy.visit(`/reset-password/fake_token`);
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
			cy.visit(`/reset-password/fake_token`);
			cy.get('button[type="submit"]').click();
			cy.get('input[name="password"]:invalid').should('have.length', 1);
		});
	});

	context('password too short', () => {
		it('shows an error showing the password length must be within certain limits', () => {
			cy.mockNext(200);
			cy.visit(`/reset-password/fake_token`);
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
			cy.visit(`/reset-password/fake_token`);
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
			cy.visit(`/reset-password/fake_token`);
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
			cy.visit(`/reset-password/fake_token`);
			cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
			cy.wait('@breachCheck');
			cy.get('button[type="submit"]').click();
			cy.contains(
				'There was a problem changing your password, please try again.',
			);
		});
	});
});
