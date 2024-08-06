import { Status } from '../../../src/server/models/okta/User';
import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';

describe('Registration flow - Split 1/2', () => {
	context.only('Registering with Okta', () => {
		it('successfully registers using an email with no existing account using a passcode', () => {
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
					cy.get('input[name=code]').type(code!);

					cy.get('form')
						.should('have.attr', 'action')
						.and('match', new RegExp(encodedReturnUrl))
						.and('match', new RegExp(refViewId))
						.and('match', new RegExp(encodedRef))
						.and('match', new RegExp(clientId));

					cy.contains('Submit verification code').click();

					// password page
					cy.url().should('include', '/welcome/password');
					cy.get('form')
						.should('have.attr', 'action')
						.and('match', new RegExp(encodedReturnUrl))
						.and('match', new RegExp(refViewId))
						.and('match', new RegExp(encodedRef))
						.and('match', new RegExp(clientId));

					cy.get('input[name="firstName"]').type('First Name');
					cy.get('input[name="secondName"]').type('Last Name');
					cy.get('input[name="password"]').type(randomPassword());
					cy.get('button[type="submit"]').click();

					// test the registration platform is set correctly
					cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.ACTIVE);
						expect(oktaUser.profile.registrationPlatform).to.eq('profile');
					});

					cy.url().should('contain', '/welcome/review');
				},
			);
		});

		it('successfully registers using an email with no existing account using a passcode and redirects to fromURI', () => {
			const appClientId = 'appClientId1';
			const fromURI = '%2FfromURI1';

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
					cy.get('input[name=code]').type(code!);

					cy.get('form')
						.should('have.attr', 'action')
						.and('match', new RegExp(encodedReturnUrl))
						.and('match', new RegExp(refViewId))
						.and('match', new RegExp(encodedRef))
						.and('match', new RegExp(appClientId))
						.and('match', new RegExp(fromURI));

					cy.contains('Submit verification code').click();

					// password page
					cy.url().should('include', '/welcome/password');
					cy.get('form')
						.should('have.attr', 'action')
						.and('match', new RegExp(encodedReturnUrl))
						.and('match', new RegExp(refViewId))
						.and('match', new RegExp(encodedRef))
						.and('match', new RegExp(appClientId))
						.and('match', new RegExp(fromURI));

					cy.get('input[name="password"]').type(randomPassword());
					cy.get('button[type="submit"]').click();

					// test the registration platform is set correctly
					cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.ACTIVE);
						expect(oktaUser.profile.registrationPlatform).to.eq('profile');
					});

					cy.url().should('contain', decodeURIComponent(fromURI));
				},
			);
		});

		it('registers registrationLocation for email with no existing account if cmp is NOT consented', () => {
			const unregisteredEmail = randomMailosaurEmail();
			cy.enableCMP();
			cy.visit(`/register/email`);
			cy.setCookie('cypress-mock-state', 'FR');
			cy.declineCMP();

			cy.get('input[name=email]').type(unregisteredEmail);

			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Enter your code');
			cy.contains(unregisteredEmail);

			cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
				expect(oktaUser.profile.registrationLocation).to.eq('Europe');
			});
		});

		it('registers registrationLocation for email with no existing account if cmp IS consented', () => {
			const unregisteredEmail = randomMailosaurEmail();
			cy.enableCMP();
			cy.visit(`/register/email`);
			cy.setCookie('cypress-mock-state', 'FR');
			cy.acceptCMP();

			cy.get('input[name=email]').type(unregisteredEmail);

			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Enter your code');
			cy.contains(unregisteredEmail);

			cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
				expect(oktaUser.profile.registrationLocation).to.eq('Europe');
			});
		});

		it('successfully blocks the password set page /welcome if a password has already been set', () => {
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
					cy.get('input[name=code]').type(code!);
					cy.contains('Submit verification code').click();

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
					cy.get('input[name=code]').type(`${+code! + 1}`);

					cy.contains('Submit verification code').click();

					cy.url().should('include', '/register/code');

					cy.contains('Incorrect code');

					cy.get('input[name=code]').clear().type(code!);
					cy.contains('Submit verification code').click();

					cy.url().should('contain', '/welcome/password');
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
					cy.get('input[name=code]').clear().type(code!);
					cy.contains('Submit verification code').click();

					cy.url().should('contain', '/welcome/password');

					cy.go('back');
					cy.url().should('contain', '/register/email');
					cy.contains('Email verified');
					cy.contains('Complete creating account').click();

					cy.url().should('contain', '/welcome/password');

					cy.get('input[name="password"]').type(randomPassword());
					cy.get('button[type="submit"]').click();

					cy.url().should('contain', '/welcome/review');
				},
			);
		});

		it('resend email functionality', () => {
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

					cy.get('input[name=code]').type(code!);
					cy.contains('Submit verification code').click();

					cy.url().should('contain', '/welcome/password');
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
	});

	context('Existing users attempting to register with Okta', () => {
		it('should send a STAGED user a set password email with an Okta activation token', () => {
			// Test users created via IDAPI-with-Okta do not have the activation
			// lifecycle run at creation, so they don't transition immediately from
			// STAGED to PROVISIONED (c.f.
			// https://developer.okta.com/docs/reference/api/users/#create-user) .
			// This is useful for us as we can test STAGED users first, then test
			// PROVISIONED users in the next test by activating a STAGED user. Users
			// created through Gateway-with-Okta do have this lifecycle run, so if we
			// rebuild these tests to not use IDAPI at all, we need to figure out a
			// way to test STAGED and PROVISIONED users (probably by just passing an
			// optional `activate` prop to a createUser function).
			cy
				.createTestUser({
					isGuestUser: true,
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.STAGED);

						cy.visit('/register/email');
						const timeRequestWasMade = new Date();

						cy.get('input[name=email]').type(emailAddress);
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.contains('Check your inbox');
						cy.contains(emailAddress);
						cy.contains('send again');
						cy.contains('try another address');

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
							expect(setPasswordLink?.href).not.to.have.string('useOkta=true');
							cy.visit(setPasswordLink?.href as string);
							cy.contains('Create password');
							cy.contains(emailAddress);
						});
					});
				});
		});

		it('should send a STAGED user a set password email with an Okta activation token, and has a prefixed activation token when using a native app', () => {
			// Test users created via IDAPI-with-Okta do not have the activation
			// lifecycle run at creation, so they don't transition immediately from
			// STAGED to PROVISIONED (c.f.
			// https://developer.okta.com/docs/reference/api/users/#create-user) .
			// This is useful for us as we can test STAGED users first, then test
			// PROVISIONED users in the next test by activating a STAGED user. Users
			// created through Gateway-with-Okta do have this lifecycle run, so if we
			// rebuild these tests to not use IDAPI at all, we need to figure out a
			// way to test STAGED and PROVISIONED users (probably by just passing an
			// optional `activate` prop to a createUser function).
			cy
				.createTestUser({
					isGuestUser: true,
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.STAGED);

						const appClientId = Cypress.env('OKTA_ANDROID_CLIENT_ID');
						const fromURI = 'fromURI1';

						cy.visit(
							`/register/email?appClientId=${appClientId}&fromURI=${fromURI}`,
						);
						const timeRequestWasMade = new Date();

						cy.get('input[name=email]').type(emailAddress);
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.contains('Check your inbox');
						cy.contains(emailAddress);
						cy.contains('send again');
						cy.contains('try another address');

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
							expect(setPasswordLink?.href ?? '')
								.to.have.string('al_')
								.and.not.to.have.string('useOkta=true');
							cy.visit(setPasswordLink?.href as string);
							cy.contains('Create password');
							cy.contains(emailAddress);
						});
					});
				});
		});

		it('should send a PROVISIONED user a set password email with an Okta activation token', () => {
			cy
				.createTestUser({
					isGuestUser: true,
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					cy.activateTestOktaUser(emailAddress).then(() => {
						cy.getTestOktaUser(emailAddress).then((oktaUser) => {
							expect(oktaUser.status).to.eq(Status.PROVISIONED);

							cy.visit('/register/email');
							const timeRequestWasMade = new Date();

							cy.get('input[name=email]').type(emailAddress);
							cy.get('[data-cy="main-form-submit-button"]').click();

							cy.contains('Check your inbox');
							cy.contains(emailAddress);
							cy.contains('send again');
							cy.contains('try another address');

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
								expect(setPasswordLink?.href).not.to.have.string(
									'useOkta=true',
								);
								cy.visit(setPasswordLink?.href as string);
								cy.contains('Create password');
								cy.contains(emailAddress);
							});
						});
					});
				});
		});
		it('should send an ACTIVE UNvalidated user with a password a security email with activation token', () => {
			cy
				.createTestUser({
					isGuestUser: false,
					isUserEmailValidated: false,
				})
				?.then(({ emailAddress }) => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.ACTIVE);

						cy.visit('/register/email');
						const timeRequestWasMade = new Date();

						cy.get('input[name=email]').type(emailAddress);
						cy.get('[data-cy="main-form-submit-button"]').click();

						// Make sure that we don't get sent to the 'security reasons' page
						cy.url().should('include', '/register/email-sent');
						cy.contains(
							'For security reasons we need you to change your password.',
						).should('not.exist');
						cy.contains(emailAddress);
						cy.contains('send again');
						cy.contains('try another address');

						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade,
							/reset-password\/([^"]*)/,
						).then(({ links, body }) => {
							expect(body).to.have.string(
								'Because your security is extremely important to us, we have changed our password policy.',
							);
							expect(body).to.have.string('Reset password');
							expect(links.length).to.eq(2);
							const resetPasswordLink = links.find((s) =>
								s.text?.includes('Reset password'),
							);
							cy.visit(resetPasswordLink?.href as string);
							cy.contains(emailAddress);
							cy.contains('Create new password');
						});
					});
				});
		});
		it('should send an ACTIVE validated user WITH a password a reset password email with an activation token', () => {
			cy
				.createTestUser({
					isGuestUser: false,
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.ACTIVE);

						cy.visit('/register/email');
						const timeRequestWasMade = new Date();

						cy.get('input[name=email]').type(emailAddress);
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.contains('Check your inbox');
						cy.contains(emailAddress);
						cy.contains('send again');
						cy.contains('try another address');

						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade,
							/reset-password\/([^"]*)/,
						).then(({ links, body }) => {
							expect(body).to.have.string('This account already exists');
							expect(body).to.have.string('Sign in');
							expect(body).to.have.string('Reset password');
							expect(links.length).to.eq(3);
							const resetPasswordLink = links.find((s) =>
								s.text?.includes('Reset password'),
							);
							expect(resetPasswordLink?.href ?? '').not.to.have.string(
								'useOkta=true',
							);
							cy.visit(resetPasswordLink?.href as string);
							cy.contains(emailAddress);
							cy.contains('Create new password');
						});
					});
				});
		});
		it('should send an ACTIVE validated user WITH a password a reset password email with an activation token, and prefixed activation token if using native app', () => {
			cy
				.createTestUser({
					isGuestUser: false,
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.ACTIVE);

						const appClientId = Cypress.env('OKTA_ANDROID_CLIENT_ID');
						const fromURI = 'fromURI1';

						cy.visit(
							`/register/email?appClientId=${appClientId}&fromURI=${fromURI}`,
						);
						const timeRequestWasMade = new Date();

						cy.get('input[name=email]').type(emailAddress);
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.contains('Check your inbox');
						cy.contains(emailAddress);
						cy.contains('send again');
						cy.contains('try another address');

						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade,
							/reset-password\/([^"]*)/,
						).then(({ links, body }) => {
							expect(body).to.have.string('This account already exists');
							expect(body).to.have.string('Sign in');
							expect(body).to.have.string('Reset password');
							expect(links.length).to.eq(3);
							const resetPasswordLink = links.find((s) =>
								s.text?.includes('Reset password'),
							);
							expect(resetPasswordLink?.href ?? '')
								.to.have.string('al_')
								.and.not.to.have.string('useOkta=true');
							cy.visit(resetPasswordLink?.href as string);
							cy.contains(emailAddress);
							cy.contains('Create new password');
						});
					});
				});
		});
		it('should send a RECOVERY user a reset password email with an Okta activation token', () => {
			cy
				.createTestUser({
					isGuestUser: false,
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					cy.resetOktaUserPassword(emailAddress).then(() => {
						cy.getTestOktaUser(emailAddress).then((oktaUser) => {
							expect(oktaUser.status).to.eq(Status.RECOVERY);

							cy.visit('/register/email');
							const timeRequestWasMade = new Date();

							cy.get('input[name=email]').type(emailAddress);
							cy.get('[data-cy="main-form-submit-button"]').click();

							cy.contains('Check your inbox');
							cy.contains(emailAddress);
							cy.contains('send again');
							cy.contains('try another address');

							cy.checkForEmailAndGetDetails(
								emailAddress,
								timeRequestWasMade,
								/reset-password\/([^"]*)/,
							).then(({ links, body }) => {
								expect(body).to.have.string('Password reset');
								expect(body).to.have.string('Reset password');
								expect(links.length).to.eq(2);
								const resetPasswordLink = links.find((s) =>
									s.text?.includes('Reset password'),
								);
								expect(resetPasswordLink?.href ?? '').not.to.have.string(
									'useOkta=true',
								);
								cy.visit(resetPasswordLink?.href as string);
								cy.contains('Create new password');
								cy.contains(emailAddress);
							});
						});
					});
				});
		});
		it('should send a PASSWORD_EXPIRED user a reset password email with an Okta activation token', () => {
			cy
				.createTestUser({
					isGuestUser: false,
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					cy.expireOktaUserPassword(emailAddress).then(() => {
						cy.getTestOktaUser(emailAddress).then((oktaUser) => {
							expect(oktaUser.status).to.eq(Status.PASSWORD_EXPIRED);

							cy.visit('/register/email');
							const timeRequestWasMade = new Date();

							cy.get('input[name=email]').type(emailAddress);
							cy.get('[data-cy="main-form-submit-button"]').click();

							cy.contains('Check your inbox');
							cy.contains(emailAddress);
							cy.contains('send again');
							cy.contains('try another address');

							cy.checkForEmailAndGetDetails(
								emailAddress,
								timeRequestWasMade,
								/reset-password\/([^"]*)/,
							).then(({ links, body }) => {
								expect(body).to.have.string('Password reset');
								expect(body).to.have.string('Reset password');
								expect(links.length).to.eq(2);
								const resetPasswordLink = links.find((s) =>
									s.text?.includes('Reset password'),
								);
								expect(resetPasswordLink?.href ?? '').not.to.have.string(
									'useOkta=true',
								);
								cy.visit(resetPasswordLink?.href as string);
								cy.contains('Create new password');
								cy.contains(emailAddress);
							});
						});
					});
				});
		});
		it('should display an error if a SUSPENDED user attempts to register', () => {
			cy
				.createTestUser({
					isGuestUser: false,
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					cy.suspendOktaUser(emailAddress).then(() => {
						cy.getTestOktaUser(emailAddress).then((oktaUser) => {
							expect(oktaUser.status).to.eq(Status.SUSPENDED);

							cy.visit('/register/email');

							cy.get('input[name=email]').type(emailAddress);
							cy.get('[data-cy="main-form-submit-button"]').click();

							cy.contains('There was a problem registering, please try again.');
						});
					});
				});
		});
	});
});
