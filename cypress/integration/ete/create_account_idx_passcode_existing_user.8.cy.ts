import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';
import { Status } from '../../../src/server/models/okta/User';

const existingUserSendEmailAndValidatePasscode = ({
	emailAddress,
	expectedReturnUrl = 'https://m.code.dev-theguardian.com/',
	params = '',
	expectedEmailBody = 'Your one-time passcode',
	additionalTests,
}: {
	emailAddress: string;
	expectedReturnUrl?: string;
	params?: string;
	expectedEmailBody?: 'Your one-time passcode' | 'Your verification code';
	additionalTests?: 'passcode-incorrect' | 'resend-email' | 'change-email';
}) => {
	cy.setCookie('cypress-mock-state', '1'); // passcode send again timer

	cy.visit(`/register/email?${params}`);
	cy.get('input[name=email]').clear().type(emailAddress);

	const timeRequestWasMade = new Date();
	cy.get('[data-cy="main-form-submit-button"]').click();

	cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
		({ body, codes }) => {
			// email
			expect(body).to.have.string(expectedEmailBody);
			expect(codes?.length).to.eq(1);
			const code = codes?.[0].value;
			expect(code).to.match(/^\d{6}$/);

			// passcode page
			cy.url().should('include', '/register/email-sent');
			cy.contains('Enter your code');

			switch (additionalTests) {
				case 'resend-email':
					{
						const timeRequestWasMade2 = new Date();
						cy.wait(1000); // wait for the send again button to be enabled
						cy.contains('send again').click();

						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade2,
						).then(({ body, codes }) => {
							// email
							expect(body).to.have.string(expectedEmailBody);
							expect(codes?.length).to.eq(1);
							const code = codes?.[0].value;
							expect(code).to.match(/^\d{6}$/);

							cy.contains('Submit verification code');
							cy.get('input[name=code]').type(code!);

							cy.contains('Return to the Guardian')
								.should('have.attr', 'href')
								.and('include', expectedReturnUrl);

							cy.getTestOktaUser(emailAddress).then((user) => {
								expect(user.status).to.eq('ACTIVE');
								expect(user.profile.emailValidated).to.eq(true);
							});
						});
					}
					break;
				case 'change-email': {
					cy.contains('try another address').click();
					cy.url().should('include', '/register/email');
					break;
				}
				case 'passcode-incorrect':
					{
						cy.contains('Submit verification code');
						cy.get('input[name=code]').type(`123456`);

						cy.url().should('include', '/register/code');

						cy.contains('Incorrect code');
						cy.get('input[name=code]').clear().type(code!);

						cy.contains('Submit verification code').click();

						cy.url().should('include', '/welcome/existing');
						cy.contains('Return to the Guardian')
							.should('have.attr', 'href')
							.and('include', expectedReturnUrl);

						cy.getTestOktaUser(emailAddress).then((user) => {
							expect(user.status).to.eq('ACTIVE');
							expect(user.profile.emailValidated).to.eq(true);
						});
					}
					break;
				default: {
					cy.contains('Submit verification code');
					cy.get('input[name=code]').type(code!);

					if (params?.includes('fromURI')) {
						cy.url().should('include', expectedReturnUrl);
					} else {
						cy.url().should('include', '/welcome/existing');
						cy.contains('Return to the Guardian')
							.should('have.attr', 'href')
							.and('include', expectedReturnUrl);

						cy.getTestOktaUser(emailAddress).then((user) => {
							expect(user.status).to.eq('ACTIVE');
							expect(user.profile.emailValidated).to.eq(true);
						});
					}
				}
			}
		},
	);
};

describe('Create account flow - passcode - existing account', () => {
	// set up useful variables
	const returnUrl =
		'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';
	const encodedReturnUrl = encodeURIComponent(returnUrl);
	const appClientId = 'appClientId1';
	const fromURI = '/oauth2/v1/authorize';

	context('ACTIVE user - with email authenticator', () => {
		it('Should sign in with passcode', () => {
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					existingUserSendEmailAndValidatePasscode({
						emailAddress,
					});
				});
		});

		it('should sign in with passocde - preserve returnUrl', () => {
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					existingUserSendEmailAndValidatePasscode({
						emailAddress,
						expectedReturnUrl: returnUrl,
						params: `returnUrl=${encodedReturnUrl}`,
					});
				});
		});

		it('should sign in with passcode - preserve fromURI', () => {
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					existingUserSendEmailAndValidatePasscode({
						emailAddress,
						expectedReturnUrl: fromURI,
						params: `fromURI=${fromURI}&appClientId=${appClientId}`,
					});
				});
		});

		it('should sign in with passcode - resend email', () => {
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					existingUserSendEmailAndValidatePasscode({
						emailAddress,
						additionalTests: 'resend-email',
					});
				});
		});

		it('should sign in with passcode - change email', () => {
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					existingUserSendEmailAndValidatePasscode({
						emailAddress,
						additionalTests: 'change-email',
					});
				});
		});

		it('should sign in with passcode - passcode incorrect', () => {
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					existingUserSendEmailAndValidatePasscode({
						emailAddress,
						additionalTests: 'passcode-incorrect',
					});
				});
		});
	});

	it('should redirect with error when multiple passcode attempts fail', () => {
		cy
			.createTestUser({
				isUserEmailValidated: true,
			})
			?.then(({ emailAddress }) => {
				cy.setCookie('cypress-mock-state', '1'); // passcode send again timer

				cy.visit(`/register/email`);
				cy.get('input[name=email]').clear().type(emailAddress);

				const timeRequestWasMade = new Date();
				cy.get('[data-cy="main-form-submit-button"]').click();

				cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
					({ body, codes }) => {
						// email
						expect(body).to.have.string('Your one-time passcode');
						expect(codes?.length).to.eq(1);
						const code = codes?.[0].value;
						expect(code).to.match(/^\d{6}$/);

						// passcode page
						cy.url().should('include', '/register/email-sent');
						cy.contains('Enter your code');

						// attempt 1 - auto submit
						cy.contains('Submit verification code');
						cy.get('input[name=code]').type('000000');
						cy.contains('Incorrect code');
						cy.url().should('include', '/register/code');

						// attempt 2 - manual submit
						cy.get('input[name=code]').type('000000');
						cy.contains('Submit verification code').click();
						cy.contains('Incorrect code');
						cy.url().should('include', '/register/code');

						// attempt 3
						cy.get('input[name=code]').type('000000');
						cy.contains('Submit verification code').click();
						cy.contains('Incorrect code');
						cy.url().should('include', '/register/code');

						// attempt 4
						cy.get('input[name=code]').type('000000');
						cy.contains('Submit verification code').click();
						cy.contains('Incorrect code');
						cy.url().should('include', '/register/code');

						// attempt 5
						cy.get('input[name=code]').type('000000');
						cy.contains('Submit verification code').click();
						cy.url().should('include', '/register/email');
						cy.contains('Your code has expired');
					},
				);
			});
	});

	context('ACTIVE user - with only password authenticator', () => {
		it('should sign in with passcode', () => {
			/**
			 * START - SETUP USER WITH ONLY PASSWORD AUTHENTICATOR
			 */
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

					// make sure we don't use a passcode
					// we instead reset their password using classic flow to set a password
					cy.visit('/reset-password?useOktaClassic=true');

					const timeRequestWasMade = new Date();
					cy.get('input[name=email]').clear().type(emailAddress);
					cy.get('[data-cy="main-form-submit-button"]').click();

					cy.checkForEmailAndGetDetails(
						emailAddress,
						timeRequestWasMade,
						/\/set-password\/([^"]*)/,
					).then(({ links, body }) => {
						expect(body).to.have.string('Welcome back');

						expect(body).to.have.string('Create password');
						expect(links.length).to.eq(2);
						const setPasswordLink = links.find((s) =>
							s.text?.includes('Create password'),
						);

						cy.visit(setPasswordLink?.href as string);

						const password = randomPassword();
						cy.get('input[name=password]').type(password);

						cy.get('[data-cy="main-form-submit-button"]')
							.click()
							.should('be.disabled');
						cy.contains('Password created');
						cy.contains(emailAddress.toLowerCase());

						/**
						 * END - SETUP USER WITH ONLY PASSWORD AUTHENTICATOR
						 */
						cy.visit('/signin?usePasscodeSignIn=true');
						cy.contains('Sign in with a different email').click();
						existingUserSendEmailAndValidatePasscode({
							emailAddress,
							expectedEmailBody: 'Your verification code',
						});
					});
				},
			);
		});
	});

	context('non-ACTIVE user', () => {
		it('STAGED user - should sign in with passcode', () => {
			cy.createTestUser({ isGuestUser: true })?.then(({ emailAddress }) => {
				cy.getTestOktaUser(emailAddress).then((oktaUser) => {
					expect(oktaUser.status).to.eq(Status.STAGED);

					existingUserSendEmailAndValidatePasscode({
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

						existingUserSendEmailAndValidatePasscode({ emailAddress });
					});
				});
			});
		});

		it('RECOVERY user - should sign in with passcode', () => {
			cy.createTestUser({ isGuestUser: false })?.then(({ emailAddress }) => {
				cy.resetOktaUserPassword(emailAddress).then(() => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.RECOVERY);

						existingUserSendEmailAndValidatePasscode({ emailAddress });
					});
				});
			});
		});

		it('PASSWORD_EXPIRED user - should sign in with passcode', () => {
			cy.createTestUser({ isGuestUser: false })?.then(({ emailAddress }) => {
				cy.expireOktaUserPassword(emailAddress).then(() => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.PASSWORD_EXPIRED);

						existingUserSendEmailAndValidatePasscode({ emailAddress });
					});
				});
			});
		});
	});
});
