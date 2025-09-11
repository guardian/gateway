import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';
import { Status } from '../../../src/server/models/okta/User';

const breachCheck = () => {
	cy.intercept({
		method: 'GET',
		url: 'https://api.pwnedpasswords.com/range/*',
	}).as('breachCheck');
};

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

describe('Registration flow - Split 1/3', () => {
	context('Registering with Okta', () => {
		it('successfully registers using an email with no existing account using a passcode - passwordless user', () => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';
			const clientId = 'jobs';

			cy.visit(
				`/register/email?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}`,
			);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Enter your one-time code');
			cy.contains(unregisteredEmail);
			cy.contains('send again');
			cy.contains('try another address');

			cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
				({ body, codes }) => {
					// email
					expect(body).to.have.string('Your verification code');
					expect(codes?.length).to.eq(1);
					const code = codes?.[0].value;
					expect(code).to.match(/^\d{6}$/);

					// passcode page
					cy.url().should('include', '/passcode');
					cy.get('form')
						.should('have.attr', 'action')
						.and('match', new RegExp(encodedReturnUrl))
						.and('match', new RegExp(refViewId))
						.and('match', new RegExp(encodedRef))
						.and('match', new RegExp(clientId));

					cy.contains('Submit verification code');

					cy.get('input[name=code]').type(code!);

					// test the registration platform is set correctly
					cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.ACTIVE);
						expect(oktaUser.profile.registrationPlatform).to.eq('profile');
					});

					cy.url().should('contain', '/welcome/review');
				},
			);
		});

		it('successfully registers using an email with no existing account using a passcode and redirects to fromURI - passwordless user', () => {
			const appClientId = 'appClientId1';
			const fromURI = '/oauth2/v1/authorize';

			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept(
				'GET',
				`https://${Cypress.env('BASE_URI')}${decodeURIComponent(fromURI)}`,
				(req) => {
					req.reply(200);
				},
			);

			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';

			cy.visit(
				`/register/email?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&appClientId=${appClientId}&fromURI=${fromURI}`,
			);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Enter your one-time code');
			cy.contains(unregisteredEmail);
			cy.contains('send again');
			cy.contains('try another address');

			cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
				({ body, codes }) => {
					// email
					expect(body).to.have.string('Your verification code');
					expect(codes?.length).to.eq(1);
					const code = codes?.[0].value;
					expect(code).to.match(/^\d{6}$/);

					// passcode page
					cy.url().should('include', '/passcode');
					cy.get('form')
						.should('have.attr', 'action')
						.and('match', new RegExp(encodedReturnUrl))
						.and('match', new RegExp(refViewId))
						.and('match', new RegExp(encodedRef))
						.and('match', new RegExp(appClientId))
						.and('match', new RegExp(encodeURIComponent(fromURI)));

					cy.contains('Submit verification code');
					cy.get('input[name=code]').type(code!);

					// test the registration platform is set correctly
					cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.ACTIVE);
						expect(oktaUser.profile.registrationPlatform).to.eq('profile');
					});

					cy.url().should('include', '/welcome/review');
					cy.get('button[type="submit"]').click();

					cy.url().should('contain', decodeURIComponent(fromURI));
				},
			);
		});

		it('successfully registers using an email with no existing account using a passcode and redirects to fromURI - password user', () => {
			const appClientId = 'appClientId1';
			const fromURI = '/oauth2/v1/authorize';

			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept(
				'GET',
				`https://${Cypress.env('BASE_URI')}${decodeURIComponent(fromURI)}`,
				(req) => {
					req.reply(200);
				},
			);

			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';

			cy.visit(
				`/register/email?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&appClientId=${appClientId}&fromURI=${fromURI}&useSetPassword=true`,
			);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Enter your code');
			cy.contains(unregisteredEmail);
			cy.contains('send again');
			cy.contains('try another address');

			cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
				({ body, codes }) => {
					// email
					expect(body).to.have.string('Your verification code');
					expect(codes?.length).to.eq(1);
					const code = codes?.[0].value;
					expect(code).to.match(/^\d{6}$/);

					// passcode page
					cy.url().should('include', '/register/email-sent');
					cy.get('form')
						.should('have.attr', 'action')
						.and('match', new RegExp(encodedReturnUrl))
						.and('match', new RegExp(refViewId))
						.and('match', new RegExp(encodedRef))
						.and('match', new RegExp(appClientId))
						.and('match', new RegExp(encodeURIComponent(fromURI)));

					cy.contains('Submit verification code');
					cy.get('input[name=code]').type(code!);

					cy.get('input[name="password"]').type(randomPassword());
					cy.get('button[type="submit"]').click();

					// test the registration platform is set correctly
					cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.ACTIVE);
						expect(oktaUser.profile.registrationPlatform).to.eq('profile');
					});

					cy.url().should('include', '/welcome/review');
					cy.get('button[type="submit"]').click();

					cy.url().should('contain', decodeURIComponent(fromURI));
				},
			);
		});

		it('registers registrationLocation for email with no existing account', () => {
			const unregisteredEmail = randomMailosaurEmail();

			cy.visit(`/register/email`);
			cy.setCookie('cypress-mock-state', 'FR');
			cy.get('input[name=email]').type(unregisteredEmail);

			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Enter your code');
			cy.contains(unregisteredEmail);

			cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
				expect(oktaUser.profile.registrationLocation).to.eq('Europe');
			});
		});

		it('registers registrationLocation and registrationLocationState for email with no existing account', () => {
			const unregisteredEmail = randomMailosaurEmail();

			cy.visit(`/register/email`);
			cy.setCookie('cypress-mock-state', 'AU-ACT');
			cy.get('input[name=email]').type(unregisteredEmail);

			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Enter your code');
			cy.contains(unregisteredEmail);

			cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
				expect(oktaUser.profile.registrationLocation).to.eq('Australia');
				expect(oktaUser.profile.registrationLocationState).to.eq(
					'Australian Capital Territory',
				);
			});
		});

		it('successfully blocks the password set page /welcome if a password has already been set - password user', () => {
			const unregisteredEmail = randomMailosaurEmail();
			cy.visit(`/register/email?useSetPassword=true`);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Enter your code');
			cy.contains(unregisteredEmail);
			cy.contains('send again');
			cy.contains('try another address');

			cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
				({ body, codes }) => {
					// email
					expect(body).to.have.string('Your verification code');
					expect(codes?.length).to.eq(1);
					const code = codes?.[0].value;
					expect(code).to.match(/^\d{6}$/);

					// passcode page
					cy.url().should('include', '/register/email-sent');
					cy.contains('Submit verification code');
					cy.get('input[name=code]').type(code!);

					cy.contains('Complete creating account');

					cy.get('input[name="password"]').type(randomPassword());
					cy.get('button[type="submit"]').click();
					cy.url().should('contain', '/welcome/review');
					cy.go('back');
					cy.url().should('contain', '/welcome/');
					cy.contains('Password already set for');
				},
			);
		});

		it('passcode incorrect functionality', () => {
			const unregisteredEmail = randomMailosaurEmail();
			cy.visit(`/register/email`);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Enter your code');
			cy.contains(unregisteredEmail);
			cy.contains('send again');
			cy.contains('try another address');

			cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
				({ body, codes }) => {
					// email
					expect(body).to.have.string('Your verification code');
					expect(codes?.length).to.eq(1);
					const code = codes?.[0].value;
					expect(code).to.match(/^\d{6}$/);

					// passcode page
					cy.url().should('include', '/register/email-sent');
					cy.contains('Submit verification code');
					cy.get('input[name=code]').type(`${+code! + 1}`);

					cy.url().should('include', '/register/code');

					cy.contains('Incorrect code');

					cy.get('input[name=code]').clear().type(code!);
					cy.contains('Submit verification code').click();

					cy.url().should('contain', '/welcome/review');
				},
			);
		});

		it('passcode used functionality', () => {
			const unregisteredEmail = randomMailosaurEmail();
			cy.visit(`/register/email`);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Enter your code');
			cy.contains(unregisteredEmail);
			cy.contains('send again');
			cy.contains('try another address');

			cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
				({ body, codes }) => {
					// email
					expect(body).to.have.string('Your verification code');
					expect(codes?.length).to.eq(1);
					const code = codes?.[0].value;
					expect(code).to.match(/^\d{6}$/);

					// passcode page
					cy.contains('Submit verification code');
					cy.get('input[name=code]').clear().type(code!);

					cy.url().should('contain', '/welcome/review');

					cy.go('back');
					cy.url().should('contain', '/register/email');
					cy.contains('Email verified');
					cy.contains('Complete creating account').click();

					cy.url().should('contain', '/welcome/review');
				},
			);
		});

		it('resend email functionality', () => {
			cy.setCookie('cypress-mock-state', '1'); // passcode send again timer
			const unregisteredEmail = randomMailosaurEmail();
			cy.visit(`/register/email`);

			const timeRequestWasMade1 = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Enter your code');
			cy.contains(unregisteredEmail);
			cy.contains('send again');
			cy.contains('try another address');

			cy.checkForEmailAndGetDetails(
				unregisteredEmail,
				timeRequestWasMade1,
			).then(({ body, codes }) => {
				// email
				expect(body).to.have.string('Your verification code');
				expect(codes?.length).to.eq(1);
				const code = codes?.[0].value;
				expect(code).to.match(/^\d{6}$/);

				// passcode page
				cy.url().should('include', '/register/email-sent');
				const timeRequestWasMade2 = new Date();
				cy.wait(1000); // wait for the send again button to be enabled
				cy.contains('send again').click();
				cy.checkForEmailAndGetDetails(
					unregisteredEmail,
					timeRequestWasMade2,
				).then(({ body, codes }) => {
					// email
					expect(body).to.have.string('Your verification code');
					expect(codes?.length).to.eq(1);
					const code = codes?.[0].value;
					expect(code).to.match(/^\d{6}$/);

					// passcode page
					cy.url().should('include', '/register/email-sent');
					cy.contains('Email with verification code sent');

					cy.contains('Submit verification code');
					cy.get('input[name=code]').type(code!);

					cy.url().should('contain', '/welcome/review');
				});
			});
		});

		it('change email functionality', () => {
			const unregisteredEmail = randomMailosaurEmail();
			cy.visit(`/register/email`);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Enter your code');
			cy.contains(unregisteredEmail);
			cy.contains('send again');
			cy.contains('try another address');

			cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
				({ body, codes }) => {
					// email
					expect(body).to.have.string('Your verification code');
					expect(codes?.length).to.eq(1);
					const code = codes?.[0].value;
					expect(code).to.match(/^\d{6}$/);

					// passcode page
					cy.url().should('include', '/register/email-sent');
					cy.contains('try another address').click();

					cy.url().should('include', '/register/email');
				},
			);
		});

		it('should redirect with error when multiple passcode attempts fail', () => {
			const unregisteredEmail = randomMailosaurEmail();
			cy.visit(`/register/email`);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Enter your code');
			cy.contains(unregisteredEmail);
			cy.contains('send again');
			cy.contains('try another address');

			cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
				({ body, codes }) => {
					// email
					expect(body).to.have.string('Your verification code');
					expect(codes?.length).to.eq(1);
					const code = codes?.[0].value;
					expect(code).to.match(/^\d{6}$/);

					// passcode page
					cy.url().should('include', '/register/email-sent');

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

	context('existing user going through registration flow', () => {
		// set up useful variables
		const returnUrl =
			'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';
		const encodedReturnUrl = encodeURIComponent(returnUrl);
		const appClientId = 'appClientId1';
		const fromURI = '/oauth2/v1/authorize';

		context('ACTIVE user - with email authenticator', () => {
			it('Should sign in with passcode', () => {
				cy.createTestUser({
					isUserEmailValidated: true,
				})?.then(({ emailAddress }) => {
					existingUserSendEmailAndValidatePasscode({
						emailAddress,
					});
				});
			});

			it('should sign in with passocde - preserve returnUrl', () => {
				cy.createTestUser({
					isUserEmailValidated: true,
				})?.then(({ emailAddress }) => {
					existingUserSendEmailAndValidatePasscode({
						emailAddress,
						expectedReturnUrl: returnUrl,
						params: `returnUrl=${encodedReturnUrl}`,
					});
				});
			});

			it('should sign in with passcode - preserve fromURI', () => {
				cy.createTestUser({
					isUserEmailValidated: true,
				})?.then(({ emailAddress }) => {
					existingUserSendEmailAndValidatePasscode({
						emailAddress,
						expectedReturnUrl: fromURI,
						params: `fromURI=${fromURI}&appClientId=${appClientId}`,
					});
				});
			});

			it('should sign in with passcode - resend email', () => {
				cy.createTestUser({
					isUserEmailValidated: true,
				})?.then(({ emailAddress }) => {
					existingUserSendEmailAndValidatePasscode({
						emailAddress,
						additionalTests: 'resend-email',
					});
				});
			});

			it('should sign in with passcode - change email', () => {
				cy.createTestUser({
					isUserEmailValidated: true,
				})?.then(({ emailAddress }) => {
					existingUserSendEmailAndValidatePasscode({
						emailAddress,
						additionalTests: 'change-email',
					});
				});
			});

			it('should sign in with passcode - passcode incorrect', () => {
				cy.createTestUser({
					isUserEmailValidated: true,
				})?.then(({ emailAddress }) => {
					existingUserSendEmailAndValidatePasscode({
						emailAddress,
						additionalTests: 'passcode-incorrect',
					});
				});
			});
		});

		it('should redirect with error when multiple passcode attempts fail', () => {
			cy.createTestUser({
				isUserEmailValidated: true,
			})?.then(({ emailAddress }) => {
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

	// after launching passcodes for all users, these users should no longer be generated, as using passcodes
	// will automatically transition them to ACTIVE
	// this test is kept for posterity
	context(
		'Passcode limbo state - user does not set password after using passcode',
		() => {
			it('allows the user to recover from the STAGED state when going through register flow', () => {
				breachCheck();

				const emailAddress = randomMailosaurEmail();
				cy.visit(`/register/email?useSetPassword=true`);

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
						cy.contains('Submit verification code');
						cy.get('input[name=code]').type(code!);

						// password page
						cy.url().should('include', '/welcome/password');

						// user now in limbo state where they have not set a password
						// recover by going through classic flow
						cy.visit('/register/email?useOktaClassic=true');

						const timeRequestWasMade = new Date();
						cy.get('input[name=email]').clear().type(emailAddress);
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.contains('Check your inbox');
						cy.contains(emailAddress);

						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade,
							/\/set-password\/([^"]*)/,
						).then(({ links, body }) => {
							expect(body).to.have.string('This account already exists');

							expect(body).to.have.string('Create password');
							expect(links.length).to.eq(2);
							const setPasswordLink = links.find((s) =>
								s.text?.includes('Create password'),
							);

							cy.visit(setPasswordLink?.href as string);
							cy.contains('Create password');
							cy.contains(emailAddress);

							cy.get('input[name=password]').type(randomPassword());

							cy.wait('@breachCheck');
							cy.get('[data-cy="main-form-submit-button"]')
								.click()
								.should('be.disabled');
							cy.contains('Password created');
							cy.contains(emailAddress.toLowerCase());
						});
					},
				);
			});

			it('allows the user to recover from the PROVISIONED state when going through reset password flow', () => {
				breachCheck();

				const emailAddress = randomMailosaurEmail();
				cy.visit(`/register/email?useSetPassword=true`);

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
						cy.contains('Submit verification code');
						cy.get('input[name=code]').type(code!);

						// password page
						cy.url().should('include', '/welcome/password');

						// transition user to PROVISIONED state
						cy.activateTestOktaUser(emailAddress).then(() => {
							// user now in limbo state where they have not set a password
							// recover by going through classic flow
							cy.visit('/register/email?useOktaClassic=true');

							const timeRequestWasMade = new Date();
							cy.get('input[name=email]').clear().type(emailAddress);
							cy.get('[data-cy="main-form-submit-button"]').click();

							cy.contains('Check your inbox');
							cy.contains(emailAddress);

							cy.checkForEmailAndGetDetails(
								emailAddress,
								timeRequestWasMade,
								/\/set-password\/([^"]*)/,
							).then(({ links, body }) => {
								expect(body).to.have.string('This account already exists');

								expect(body).to.have.string('Create password');
								expect(links.length).to.eq(2);
								const setPasswordLink = links.find((s) =>
									s.text?.includes('Create password'),
								);

								cy.visit(setPasswordLink?.href as string);
								cy.contains('Create password');
								cy.contains(emailAddress);

								cy.get('input[name=password]').type(randomPassword());

								cy.wait('@breachCheck');
								cy.get('[data-cy="main-form-submit-button"]')
									.click()
									.should('be.disabled');
								cy.contains('Password created');
								cy.contains(emailAddress.toLowerCase());
							});
						});
					},
				);
			});
		},
	);
});
