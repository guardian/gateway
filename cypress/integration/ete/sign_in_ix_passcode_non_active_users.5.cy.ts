import { Status } from '../../../src/server/models/okta/User';
import { randomMailosaurEmail } from '../../support/commands/testUser';
import { sendEmailAndValidatePasscode } from './sign_in_idx_passcode_active_users.5.cy';

describe('Sign In flow, with passcode, non-ACTIVE users', () => {
	// set up useful variables
	const returnUrl =
		'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';
	const fromURI = '/oauth2/v1/authorize';

	beforeEach(() => {
		// Intercept the external redirect pages.
		// We just want to check that the redirect happens, not that the page loads.
		cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
			req.reply(200);
		});
		cy.intercept('GET', returnUrl, (req) => {
			req.reply(200);
		});
		cy.intercept(
			'GET',
			`https://${Cypress.env('BASE_URI')}${decodeURIComponent(fromURI)}`,
			(req) => {
				req.reply(200);
			},
		);
	});

	context('non-ACTIVE user', () => {
		it('STAGED user - should sign in with passcode', () => {
			cy.createTestUser({ isGuestUser: true })?.then(({ emailAddress }) => {
				cy.getTestOktaUser(emailAddress).then((oktaUser) => {
					expect(oktaUser.status).to.eq(Status.STAGED);

					sendEmailAndValidatePasscode({
						emailAddress,
					});
				});
			});
		});

		it('PROVISIONED user - should sign in with passcode', () => {
			cy.createTestUser({ isGuestUser: true })?.then(({ emailAddress }) => {
				cy.activateTestOktaUser(emailAddress).then(() => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.PROVISIONED);

						sendEmailAndValidatePasscode({ emailAddress });
					});
				});
			});
		});

		it('RECOVERY user - should sign in with passcode', () => {
			cy.createTestUser({ isGuestUser: false })?.then(({ emailAddress }) => {
				cy.resetOktaUserPassword(emailAddress).then(() => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.RECOVERY);

						sendEmailAndValidatePasscode({ emailAddress });
					});
				});
			});
		});

		it('PASSWORD_EXPIRED user - should sign in with passcode', () => {
			cy.createTestUser({ isGuestUser: false })?.then(({ emailAddress }) => {
				cy.expireOktaUserPassword(emailAddress).then(() => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.PASSWORD_EXPIRED);

						sendEmailAndValidatePasscode({ emailAddress });
					});
				});
			});
		});

		it('NON_EXISTENT user - should show email sent page with no email sent', () => {
			const emailAddress = randomMailosaurEmail();
			cy.visit(`/signin?usePasscodeSignIn=true`);

			cy.contains('Sign in');
			cy.get('input[name=email]').type(emailAddress);
			cy.get('[data-cy="main-form-submit-button"]').click();

			// passcode page
			cy.url().should('include', '/signin/code');
			cy.contains('Enter your one-time code');
			cy.contains('Don’t have an account?');

			cy.contains('Sign in');
			cy.get('input[name=code]').clear().type('123456');

			cy.url().should('include', '/signin/code');
			cy.contains('Enter your one-time code');
			cy.contains('Don’t have an account?');

			cy.contains('Incorrect code');
		});

		it('NON_EXISTENT user - should redirect with error when multiple passcode attempts fail', () => {
			const emailAddress = randomMailosaurEmail();
			cy.visit(`/signin?usePasscodeSignIn=true`);

			cy.contains('Sign in');
			cy.get('input[name=email]').type(emailAddress);
			cy.get('[data-cy="main-form-submit-button"]').click();

			// passcode page
			cy.url().should('include', '/signin/code');
			cy.contains('Enter your one-time code');
			cy.contains('Don’t have an account?');

			// attempt 1
			cy.contains('Sign in');
			cy.get('input[name=code]').type('123456');
			cy.url().should('include', '/signin/code');
			cy.contains('Incorrect code');

			// attempt 2
			cy.get('input[name=code]').type('123456');
			cy.contains('Sign in').click();
			cy.url().should('include', '/signin/code');
			cy.contains('Incorrect code');

			// attempt 3
			cy.get('input[name=code]').type('123456');
			cy.contains('Sign in').click();
			cy.url().should('include', '/signin/code');
			cy.contains('Incorrect code');

			// attempt 4
			cy.get('input[name=code]').type('123456');
			cy.contains('Sign in').click();
			cy.url().should('include', '/signin/code');
			cy.contains('Incorrect code');

			// attempt 5
			cy.get('input[name=code]').type('123456');
			cy.contains('Sign in').click();
			cy.url().should('include', '/signin');
			cy.contains('Your code has expired');
		});
	});
});
