import { Status } from '../../../src/server/models/okta/User';
import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';

describe('Password reset recovery flows - with Passcodes, non-ACTIVE users', () => {
	context('STAGED user', () => {
		it('allows the user to change their password - STAGED - No Passcode Verified', () => {
			const emailAddress = randomMailosaurEmail();
			cy.visit(`/register/email`);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(emailAddress);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Enter your code');
			cy.contains(emailAddress);

			cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
				({ body, codes }) => {
					// email
					expect(body).to.have.string('Your verification code');
					expect(codes?.length).to.eq(1);
					const code = codes?.[0].value;
					expect(code).to.match(/^\d{6}$/);

					// passcode page
					cy.url().should('include', '/register/email-sent');

					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.STAGED);
						// make sure we don't use a passcode
						// we instead reset their password using passcodes
						cy.visit('/reset-password');

						const timeRequestWasMade = new Date();
						cy.contains('Reset password');
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade,
						).then(({ body, codes }) => {
							// email
							expect(body).to.have.string('Your verification code');
							expect(codes?.length).to.eq(1);
							const code = codes?.[0].value;
							expect(code).to.match(/^\d{6}$/);

							// passcode page
							cy.url().should('include', '/reset-password/email-sent');
							cy.contains('Enter your one-time code');

							cy.contains('Submit one-time code');
							cy.get('input[name=code]').clear().type(code!);

							cy.url().should('contain', '/set-password');

							cy.get('input[name="password"]').type(randomPassword());
							cy.get('button[type="submit"]').click();

							cy.url().should('contain', '/set-password/complete');
						});
					});
				},
			);
		});

		it('allows the user to change their password - STAGED - Created via Classic API (i.e guest user)', () => {
			cy.createTestUser({ isGuestUser: true })?.then(({ emailAddress }) => {
				cy.getTestOktaUser(emailAddress).then((oktaUser) => {
					expect(oktaUser.status).to.eq(Status.STAGED);
					cy.visit('/reset-password');

					const timeRequestWasMade = new Date();
					cy.get('input[name=email]').type(emailAddress);
					cy.get('[data-cy="main-form-submit-button"]').click();

					cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
						({ body, codes }) => {
							// email
							expect(body).to.have.string('Your one-time passcode');
							expect(codes?.length).to.eq(1);
							const code = codes?.[0].value;
							expect(code).to.match(/^\d{6}$/);

							// passcode page
							cy.url().should('include', '/reset-password/email-sent');
							cy.contains('Enter your one-time code');

							cy.contains('Submit one-time code');
							cy.get('input[name=code]').clear().type(code!);

							// password page
							cy.url().should('include', '/reset-password/password');

							cy.get('input[name="password"]').type(randomPassword());
							cy.get('button[type="submit"]').click();

							// password complete page
							cy.url().should('include', '/reset-password/complete');

							cy.contains('Password updated');
						},
					);
				});
			});
		});
	});

	context('PROVISIONED user', () => {
		it('allows the user to change their password - PROVISIONED', () => {
			cy.createTestUser({ isGuestUser: true })?.then(({ emailAddress }) => {
				cy.activateTestOktaUser(emailAddress).then(() => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.PROVISIONED);
						cy.visit('/reset-password');

						const timeRequestWasMade = new Date();
						cy.get('input[name=email]').type(emailAddress);
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade,
						).then(({ body, codes }) => {
							// email
							expect(body).to.have.string('Your one-time passcode');
							expect(codes?.length).to.eq(1);
							const code = codes?.[0].value;
							expect(code).to.match(/^\d{6}$/);

							// passcode page
							cy.url().should('include', '/reset-password/email-sent');
							cy.contains('Enter your one-time code');

							cy.contains('Submit one-time code');
							cy.get('input[name=code]').clear().type(code!);

							// password page
							cy.url().should('include', '/reset-password/password');

							cy.get('input[name="password"]').type(randomPassword());
							cy.get('button[type="submit"]').click();

							// password complete page
							cy.url().should('include', '/reset-password/complete');

							cy.contains('Password updated');
						});
					});
				});
			});
		});
	});

	context('RECOVERY user', () => {
		it('allows the user to change their password - RECOVERY', () => {
			cy.createTestUser({ isGuestUser: false })?.then(({ emailAddress }) => {
				cy.resetOktaUserPassword(emailAddress).then(() => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.RECOVERY);
						cy.visit('/reset-password');

						const timeRequestWasMade = new Date();
						cy.get('input[name=email]').type(emailAddress);
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade,
						).then(({ body, codes }) => {
							// email
							expect(body).to.have.string('Your one-time passcode');
							expect(codes?.length).to.eq(1);
							const code = codes?.[0].value;
							expect(code).to.match(/^\d{6}$/);

							// passcode page
							cy.url().should('include', '/reset-password/email-sent');
							cy.contains('Enter your one-time code');

							cy.contains('Submit one-time code');
							cy.get('input[name=code]').clear().type(code!);

							// password page
							cy.url().should('include', '/reset-password/password');

							cy.get('input[name="password"]').type(randomPassword());
							cy.get('button[type="submit"]').click();

							// password complete page
							cy.url().should('include', '/reset-password/complete');

							cy.contains('Password updated');
						});
					});
				});
			});
		});
	});

	context('PASSWORD_EXPIRED user', () => {
		it('allows the user to change their password - PASSWORD_EXPIRED', () => {
			cy.createTestUser({ isGuestUser: false })?.then(({ emailAddress }) => {
				cy.expireOktaUserPassword(emailAddress).then(() => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.PASSWORD_EXPIRED);
						cy.visit('/reset-password');

						const timeRequestWasMade = new Date();
						cy.get('input[name=email]').type(emailAddress);
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade,
						).then(({ body, codes }) => {
							// email
							expect(body).to.have.string('Your one-time passcode');
							expect(codes?.length).to.eq(1);
							const code = codes?.[0].value;
							expect(code).to.match(/^\d{6}$/);

							// passcode page
							cy.url().should('include', '/reset-password/email-sent');
							cy.contains('Enter your one-time code');

							cy.contains('Submit one-time code');
							cy.get('input[name=code]').clear().type(code!);

							// password page
							cy.url().should('include', '/reset-password/password');

							cy.get('input[name="password"]').type(randomPassword());
							cy.get('button[type="submit"]').click();

							// password complete page
							cy.url().should('include', '/reset-password/complete');

							cy.contains('Password updated');
						});
					});
				});
			});
		});
	});

	context('NON_EXISTENT user', () => {
		it('shows the passcode page with no account info, and using passcode returns error', () => {
			const emailAddress = randomMailosaurEmail();
			cy.visit(`/reset-password`);

			cy.contains('Reset password');
			cy.get('input[name=email]').type(emailAddress);
			cy.get('[data-cy="main-form-submit-button"]').click();

			// passcode page
			cy.url().should('include', '/reset-password/email-sent');
			cy.contains('Enter your one-time code');
			cy.contains('Don’t have an account?');

			cy.contains('Submit one-time code');
			cy.get('input[name=code]').clear().type('123456');

			cy.url().should('include', '/reset-password/code');
			cy.contains('Enter your one-time code');
			cy.contains('Don’t have an account?');

			cy.contains('Incorrect code');
		});

		it('should redirect with error when multiple passcode attempts fail', () => {
			const emailAddress = randomMailosaurEmail();
			cy.visit(`/reset-password`);

			cy.contains('Reset password');
			cy.get('input[name=email]').type(emailAddress);
			cy.get('[data-cy="main-form-submit-button"]').click();

			// passcode page
			cy.url().should('include', '/reset-password/email-sent');
			cy.contains('Enter your one-time code');
			cy.contains('Don’t have an account?');

			// attempt 1
			cy.contains('Submit one-time code');
			cy.get('input[name=code]').type('123456');
			cy.url().should('include', '/reset-password/code');
			cy.contains('Incorrect code');

			// attempt 2
			cy.get('input[name=code]').type('123456');
			cy.contains('Submit one-time code').click();
			cy.url().should('include', '/reset-password/code');
			cy.contains('Incorrect code');

			// attempt 3
			cy.get('input[name=code]').type('123456');
			cy.contains('Submit one-time code').click();
			cy.url().should('include', '/reset-password/code');
			cy.contains('Incorrect code');

			// attempt 4
			cy.get('input[name=code]').type('123456');
			cy.contains('Submit one-time code').click();
			cy.url().should('include', '/reset-password/code');
			cy.contains('Incorrect code');

			// attempt 5
			cy.get('input[name=code]').type('123456');
			cy.contains('Submit one-time code').click();
			cy.url().should('include', '/reset-password');
			cy.contains('Your code has expired');
		});
	});
});
