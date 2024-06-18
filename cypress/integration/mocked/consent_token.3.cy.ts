import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Consent token accept flow', () => {
	beforeEach(() => {
		cy.mockPurge();
	});

	context('a11y checks', () => {
		it('Has no detectable a11y violations on consent token expired page', () => {
			cy.visit('/consent-token/abc123/accept');
			injectAndCheckAxe();
		});

		it('Has no detectable a11y violations on consent token email sent page', () => {
			cy.visit('/consent-token/abc123/accept');
			cy.get('button[type=submit]').click();
			injectAndCheckAxe();
		});
	});

	context('consent token flow', () => {
		// This test needs to be run mocked because we need to mock the
		// expired token response from IDAPI.
		it('shows the email sent page when supplied a valid, expired token', () => {
			const expiredToken = 'expired-consent-token';
			cy.mockNext(403, {
				error: {
					status: 'error',
					errors: [
						{
							message: 'Token expired',
							description: 'The link is no longer valid',
						},
					],
				},
			});
			cy.visit(`/consent-token/${expiredToken}/accept`);
			cy.contains('This link has expired.');
			cy.get('button[type=submit]').click();
			cy.url().should('include', '/consent-token/email-sent');
			cy.contains('Check your inbox');
		});
	});
});
