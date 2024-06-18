import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';
import { Status } from '../../../src/server/models/okta/User';

describe('Registration flow - Split 2/2', () => {
	context(
		'Existing users asking for an email to be resent after attempting to register with Okta',
		() => {
			it('should resend a STAGED user a set password email with an Okta activation token', () => {
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

							// Wait for the first email to arrive...
							cy.checkForEmailAndGetDetails(
								emailAddress,
								timeRequestWasMade,
								/\/set-password\/([^"]*)/,
							).then(() => {
								const timeRequestWasMade = new Date();

								cy.get('[data-cy="main-form-submit-button"]').click();

								// ...before waiting for the second email to arrive
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
									expect(setPasswordLink?.href ?? '').not.to.have.string(
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

			it('should resend a PROVISIONED user a set password email with an Okta activation token', () => {
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
								).then(() => {
									const timeRequestWasMade = new Date();
									cy.get('[data-cy="main-form-submit-button"]').click();

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
										expect(setPasswordLink?.href ?? '').not.to.have.string(
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
			});
			it('should send an ACTIVE user a reset password email with an Okta activation token', () => {
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
							).then(() => {
								const timeRequestWasMade = new Date();
								cy.get('[data-cy="main-form-submit-button"]').click();

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
									cy.contains('Create new password');
									cy.contains(emailAddress);
								});
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
								).then(() => {
									const timeRequestWasMade = new Date();
									cy.get('[data-cy="main-form-submit-button"]').click();

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
								).then(() => {
									const timeRequestWasMade = new Date();
									cy.get('[data-cy="main-form-submit-button"]').click();

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
			});
		},
	);

	context('Welcome Page - Resend (Link expired)', () => {
		it('send an email for user with no existing account', () => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();

			cy.visit(`/welcome/resend?returnUrl=${encodedReturnUrl}`);

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

					cy.get('form')
						.should('have.attr', 'action')
						.and('match', new RegExp(encodedReturnUrl));

					//we are reloading here to make sure the params are persisted even on page refresh
					cy.reload();

					cy.get('input[name="password"]').type(randomPassword());
					cy.get('button[type="submit"]').click();
					cy.url().should('contain', encodedReturnUrl);
				},
			);
		});

		it('should resend a STAGED user a set password email with an Okta activation token', () => {
			cy
				.createTestUser({
					isGuestUser: true,
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.STAGED);

						cy.visit('/welcome/resend');

						const timeRequestWasMade = new Date();

						cy.get('input[name=email]').type(emailAddress);
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.contains('Check your inbox');
						cy.contains(emailAddress);
						cy.contains('send again');
						cy.contains('try another address');

						// Wait for the first email to arrive...
						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade,
							/\/set-password\/([^"]*)/,
						).then(() => {
							const timeRequestWasMade = new Date();

							cy.get('[data-cy="main-form-submit-button"]').click();

							// ...before waiting for the second email to arrive
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
								expect(setPasswordLink?.href ?? '').not.to.have.string(
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
		it('should resend a PROVISIONED user a set password email with an Okta activation token', () => {
			cy
				.createTestUser({
					isGuestUser: true,
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					cy.activateTestOktaUser(emailAddress).then(() => {
						cy.getTestOktaUser(emailAddress).then((oktaUser) => {
							expect(oktaUser.status).to.eq(Status.PROVISIONED);

							cy.visit('/welcome/resend');

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
							).then(() => {
								const timeRequestWasMade = new Date();
								cy.get('[data-cy="main-form-submit-button"]').click();

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
									expect(setPasswordLink?.href ?? '').not.to.have.string(
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
		});
		it('should send an ACTIVE user a reset password email with an activation token', () => {
			cy
				.createTestUser({
					isGuestUser: false,
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress }) => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.ACTIVE);

						cy.visit('/welcome/resend');
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
						).then(() => {
							const timeRequestWasMade = new Date();
							cy.get('[data-cy="main-form-submit-button"]').click();

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
								cy.contains('Create new password');
								cy.contains(emailAddress);
							});
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

							cy.visit('/welcome/resend');
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
							).then(() => {
								const timeRequestWasMade = new Date();
								cy.get('[data-cy="main-form-submit-button"]').click();

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

							cy.visit('/welcome/resend');
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
							).then(() => {
								const timeRequestWasMade = new Date();
								cy.get('[data-cy="main-form-submit-button"]').click();

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
		});
	});

	context('Okta session exists on /signin', () => {
		beforeEach(() => {
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
				req.reply(200);
			});
		});

		it('shows the signed in as page', () => {
			// Create a validated test user
			cy.createTestUser({ isUserEmailValidated: true }).then(
				({ emailAddress, finalPassword }) => {
					// Sign our new user in
					cy.visit(
						`/signin?returnUrl=${encodeURIComponent(
							`https://${Cypress.env('BASE_URI')}/welcome/review`,
						)}`,
					);
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.url().should('include', '/welcome/review');

					// Get the current session data
					cy.getCookie('idx').then((originalIdxCookie) => {
						expect(originalIdxCookie).to.exist;

						// Visit register again
						cy.visit(
							`/register/email?returnUrl=${encodeURIComponent(
								`https://${Cypress.env('BASE_URI')}/welcome/review`,
							)}`,
						);
						cy.url().should('include', '/register');

						cy.contains('Sign in to the Guardian');
						cy.contains('You are signed in with');
						cy.contains(emailAddress);
						cy.contains('Continue')
							.should('have.attr', 'href')
							.and(
								'include',
								`https://${Cypress.env(
									'BASE_URI',
								)}/signin/refresh?returnUrl=https%3A%2F%2Fprofile.thegulocal.com%2Fwelcome%2Freview`,
							);
						cy.contains('a', 'Sign in')
							.should('have.attr', 'href')
							.and('include', '/signout?returnUrl=');
						cy.contains('Sign in with a different email');
					});
				},
			);
		});
	});

	// a few tests to check if the Okta Classic flow is still working using the useOktaClassic flag
	context('Okta Classic Flow', () => {
		it('create account - successfully registers using an email with no existing account', () => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';
			const clientId = 'jobs';

			// these params should *not* persist between initial registration and welcome page
			// despite the fact that they PersistableQueryParams, as these are set by the Okta SDK sign in method
			// and subsequent interception, and not by gateway
			const appClientId = 'appClientId1';
			const fromURI = 'fromURI1';

			cy.visit(
				`/register/email?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}&appClientId=${appClientId}&fromURI=${fromURI}&useOktaClassic=true`,
			);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Check your inbox');
			cy.contains(unregisteredEmail);
			cy.contains('send again');
			cy.contains('try another address');

			cy.checkForEmailAndGetDetails(
				unregisteredEmail,
				timeRequestWasMade,
				/welcome\/([^"]*)/,
			).then(({ body, token }) => {
				expect(body).to.have.string('Complete registration');
				cy.visit(`/welcome/${token}`);
				cy.contains('Complete creating account');

				cy.get('form')
					.should('have.attr', 'action')
					.and('match', new RegExp(encodedReturnUrl))
					.and('match', new RegExp(refViewId))
					.and('match', new RegExp(encodedRef))
					.and('match', new RegExp(clientId))
					.and('not.match', new RegExp(appClientId))
					.and('not.match', new RegExp(fromURI));

				//we are reloading here to make sure the params are persisted even on page refresh
				cy.reload();

				cy.get('input[name="firstName"]').type('First Name');
				cy.get('input[name="secondName"]').type('Last Name');
				cy.get('input[name="password"]').type(randomPassword());
				cy.get('button[type="submit"]').click();
				cy.url().should('contain', encodedReturnUrl);
				cy.url().should('contain', refViewId);
				cy.url().should('contain', encodedRef);
				cy.url().should('contain', clientId);
				cy.url().should('not.contain', appClientId);
				cy.url().should('not.contain', fromURI);

				// test the registration platform is set correctly
				cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
					expect(oktaUser.status).to.eq(Status.ACTIVE);
					expect(oktaUser.profile.registrationPlatform).to.eq('profile');
				});
			});
		});

		it('create account - successfully registers using an email with no existing account, and has a prefixed activation token when using a native app', () => {
			cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
				req.reply(200);
			});
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';
			const clientId = 'jobs';

			// these params should *not* persist between initial registration and welcome page
			// despite the fact that they PersistableQueryParams, as these are set by the Okta SDK sign in method
			// and subsequent interception, and not by gateway
			const appClientId = Cypress.env('OKTA_ANDROID_CLIENT_ID');
			const fromURI = 'fromURI1';

			cy.visit(
				`/register/email?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}&appClientId=${appClientId}&fromURI=${fromURI}&useOktaClassic=true`,
			);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Check your inbox');
			cy.contains(unregisteredEmail);
			cy.contains('send again');
			cy.contains('try another address');

			cy.checkForEmailAndGetDetails(
				unregisteredEmail,
				timeRequestWasMade,
				/welcome\/([^"]*)/,
			).then(({ body, token }) => {
				expect(body).to.have.string('Complete registration');
				expect(token).to.have.string('al_');
				cy.visit(`/welcome/${token}`);
				cy.contains('Complete creating account');

				cy.get('form')
					.should('have.attr', 'action')
					.and('match', new RegExp(encodedReturnUrl))
					.and('match', new RegExp(refViewId))
					.and('match', new RegExp(encodedRef))
					.and('match', new RegExp(clientId))
					.and('not.match', new RegExp(appClientId))
					.and('not.match', new RegExp(fromURI));

				//we are reloading here to make sure the params are persisted even on page refresh
				cy.reload();

				cy.get('form')
					.should('have.attr', 'action')
					.and('match', new RegExp(encodedReturnUrl))
					.and('match', new RegExp(refViewId))
					.and('match', new RegExp(encodedRef))
					.and('match', new RegExp(clientId))
					.and('not.match', new RegExp(appClientId))
					.and('not.match', new RegExp(fromURI));

				cy.get('input[name="firstName"]').type('First Name');
				cy.get('input[name="secondName"]').type('Last Name');
				cy.get('input[name="password"]').type(randomPassword());
				cy.get('button[type="submit"]').click();
				cy.url().should('contain', '/welcome/al_/complete');
				cy.contains(unregisteredEmail);
				cy.contains('Guardian app');

				// test the registration platform is set correctly
				cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
					expect(oktaUser.status).to.eq(Status.ACTIVE);
					expect(oktaUser.profile.registrationPlatform).to.eq(
						'android_live_app',
					);
				});
			});
		});

		it('welcome expired - send an email for user with no existing account', () => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();

			cy.visit(
				`/welcome/resend?returnUrl=${encodedReturnUrl}&useOktaClassic=true`,
			);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Check your inbox');
			cy.contains(unregisteredEmail);
			cy.contains('send again');
			cy.contains('try another address');

			cy.checkForEmailAndGetDetails(
				unregisteredEmail,
				timeRequestWasMade,
				/welcome\/([^"]*)/,
			).then(({ body, token }) => {
				expect(body).to.have.string('Complete registration');
				cy.visit(`/welcome/${token}`);
				cy.contains('Complete creating account');

				cy.get('form')
					.should('have.attr', 'action')
					.and('match', new RegExp(encodedReturnUrl));

				//we are reloading here to make sure the params are persisted even on page refresh
				cy.reload();

				cy.get('input[name="password"]').type(randomPassword());
				cy.get('button[type="submit"]').click();
				cy.url().should('contain', encodedReturnUrl);
			});
		});
	});
});
