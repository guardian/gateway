import { Status } from '../../../src/server/models/okta/User';
import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';

describe('Sign In flow, with passcode', () => {
	// set up useful variables
	const returnUrl =
		'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';
	const encodedReturnUrl = encodeURIComponent(returnUrl);
	const appClientId = 'appClientId1';
	const fromURI = '/oauth2/v1/authorize';

	const sendEmailAndValidatePasscode = ({
		emailAddress,
		expectedReturnUrl = 'https://m.code.dev-theguardian.com/',
		params,
		expectedEmailBody = 'Your one-time passcode',
		additionalTests,
	}: {
		emailAddress: string;
		expectedReturnUrl?: string;
		params?: string;
		expectedEmailBody?: 'Your one-time passcode' | 'Your verification code';
		additionalTests?: 'passcode-incorrect' | 'resend-email' | 'change-email';
	}) => {
		cy.visit(`/signin?${params ? `${params}&` : ''}usePasscodeSignIn=true`);
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
				cy.url().should('include', '/signin/code');
				cy.contains('Enter your one-time code');

				switch (additionalTests) {
					case 'resend-email':
						{
							const timeRequestWasMade2 = new Date();
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

								cy.get('input[name=code]').type(code!);
								cy.contains('Submit one-time code').click();

								cy.url().should('include', expectedReturnUrl);

								cy.getTestOktaUser(emailAddress).then((user) => {
									expect(user.status).to.eq('ACTIVE');
									expect(user.profile.emailValidated).to.eq(true);
								});
							});
						}
						break;
					case 'change-email':
						cy.contains('try another address').click();

						cy.url().should('include', '/signin');
						break;
					case 'passcode-incorrect':
						cy.get('input[name=code]').type(`${+code! + 1}`);

						cy.contains('Submit one-time code').click();

						cy.url().should('include', '/signin/code');

						cy.contains('Incorrect code');
						cy.get('input[name=code]').clear().type(code!);

						cy.contains('Submit one-time code').click();

						cy.url().should('include', expectedReturnUrl);

						cy.getTestOktaUser(emailAddress).then((user) => {
							expect(user.status).to.eq('ACTIVE');
							expect(user.profile.emailValidated).to.eq(true);
						});
						break;
					default: {
						cy.get('input[name=code]').type(code!);
						cy.contains('Submit one-time code').click();

						cy.url().should('include', expectedReturnUrl);

						cy.getTestOktaUser(emailAddress).then((user) => {
							expect(user.status).to.eq('ACTIVE');
							expect(user.profile.emailValidated).to.eq(true);
						});
					}
				}
			},
		);
	};

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

	context('ACTIVE user - with email authenticator', () => {
		it('should sign in with passcode', () => {
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					sendEmailAndValidatePasscode({
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
					sendEmailAndValidatePasscode({
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
					sendEmailAndValidatePasscode({
						emailAddress,
						expectedReturnUrl: fromURI,
						params: `fromURI=${fromURI}&appClientId=${appClientId}`,
					});
				});
		});

		it('selects password option to sign in', () => {
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress, finalPassword }) => {
					cy.visit(`/signin?usePasscodeSignIn=true`);
					cy.get('input[name=email]').type(emailAddress);
					cy.contains('Use a password to sign in instead').click();
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.url().should('include', 'https://m.code.dev-theguardian.com/');
				});
		});

		it('should sign in with passcode - resend email', () => {
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					sendEmailAndValidatePasscode({
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
					sendEmailAndValidatePasscode({
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
					sendEmailAndValidatePasscode({
						emailAddress,
						additionalTests: 'passcode-incorrect',
					});
				});
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
						sendEmailAndValidatePasscode({
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

			cy.get('input[name=code]').clear().type('123456');
			cy.contains('Submit one-time code').click();

			cy.url().should('include', '/signin/code');
			cy.contains('Enter your one-time code');
			cy.contains('Don’t have an account?');

			cy.contains('Incorrect code');
		});
	});
});
