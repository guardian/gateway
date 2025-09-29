import { Status } from '../../../src/server/models/okta/User';
import { randomMailosaurEmail } from '../../support/commands/testUser';

describe('Sign In flow, with passcode (part 1)', () => {
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

					cy.sendEmailAndValidatePasscode({
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

						cy.sendEmailAndValidatePasscode({ emailAddress });
					});
				});
			});
		});

		it('RECOVERY user - should sign in with passcode', () => {
			cy.createTestUser({ isGuestUser: false })?.then(({ emailAddress }) => {
				cy.resetOktaUserPassword(emailAddress).then(() => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.RECOVERY);

						cy.sendEmailAndValidatePasscode({ emailAddress });
					});
				});
			});
		});

		it('PASSWORD_EXPIRED user - should sign in with passcode', () => {
			cy.createTestUser({ isGuestUser: false })?.then(({ emailAddress }) => {
				cy.expireOktaUserPassword(emailAddress).then(() => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.PASSWORD_EXPIRED);

						cy.sendEmailAndValidatePasscode({ emailAddress });
					});
				});
			});
		});
	});
});
