import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';
import { Status } from '../../../src/server/models/okta/User';

describe('Registration flow - Split 1/2', () => {
	context('Registering with Okta', () => {
		it('successfully registers using an email with no existing account', () => {
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
				`/register/email?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}&appClientId=${appClientId}&fromURI=${fromURI}`,
			);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Check your email inbox');
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

		it('successfully registers using an email with no existing account, and has a prefixed activation token when using a native app', () => {
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
				`/register/email?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}&appClientId=${appClientId}&fromURI=${fromURI}`,
			);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Check your email inbox');
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

		it('does not register registrationLocation for email with no existing account if cmp is not consented', () => {
			const unregisteredEmail = randomMailosaurEmail();
			cy.enableCMP();
			cy.visit(`/register/email`);
			cy.setCookie('GU_geo_country', 'FR');
			cy.declineCMP();

			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('input[name=_cmpConsentedState]').should('have.value', 'false');

			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.intercept('POST', '/register**', (req) => {
				expect(req.body).to.include('_cmpConsentedState=false');
				expect(req.headers.cookie).to.include('GU_geo_country=FR');
			});
		});

		it('successfully registers registrationLocation for email with no existing account if cmp consented', () => {
			const unregisteredEmail = randomMailosaurEmail();
			cy.enableCMP();
			cy.visit(`/register/email`);
			cy.setCookie('GU_geo_country', 'FR');
			cy.acceptCMP();

			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('input[name=_cmpConsentedState]').should('have.value', 'true');

			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.intercept('POST', '/register**', (req) => {
				expect(req.body).to.include('_cmpConsentedState=true');
				expect(req.headers.cookie).to.include('GU_geo_country=FR');
			});
		});

		it('successfully blocks the password set page /welcome if a password has already been set', () => {
			const unregisteredEmail = randomMailosaurEmail();
			cy.visit(`/register/email`);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Check your email inbox');
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

				cy.get('input[name="password"]').type(randomPassword());
				cy.get('button[type="submit"]').click();
				cy.url().should('contain', '/welcome/review');
				cy.go('back');
				cy.url().should('contain', '/welcome/');
				cy.contains('Password already set for');
			});
		});

		it('completes registration and overrides returnUrl from encryptedStateCookie if one set on welcome page url', () => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();

			cy.visit(`/register/email?returnUrl=${encodedReturnUrl}`);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Check your email inbox');
			cy.contains(unregisteredEmail);
			cy.contains('send again');
			cy.contains('try another address');

			cy.checkForEmailAndGetDetails(
				unregisteredEmail,
				timeRequestWasMade,
				/welcome\/([^"]*)/,
			).then(({ body, token }) => {
				expect(body).to.have.string('Complete registration');
				const newReturnUrl = encodeURIComponent(
					'https://www.theguardian.com/technology/2017/may/04/nier-automata-sci-fi-game-sleeper-hit-designer-yoko-taro',
				);
				cy.visit(`/welcome/${token}&returnUrl=${newReturnUrl}`);
				cy.contains('Complete creating account');
				cy.url()
					.should('contain', newReturnUrl)
					.and('not.contain', encodedReturnUrl);

				cy.get('form')
					.should('have.attr', 'action')
					.and('match', new RegExp(newReturnUrl))
					.and('not.match', new RegExp(encodedReturnUrl));

				//we are reloading here to make sure the params are persisted even on page refresh
				cy.reload();

				cy.get('input[name="password"]').type(randomPassword());
				cy.get('button[type="submit"]').click();
				cy.url()
					.should('contain', newReturnUrl)
					.and('not.contain', encodedReturnUrl);
			});
		});

		it('overrides appClientId and fromURI if set on activation link', () => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();

			// these params should *not* persist between initial registration and welcome page
			// despite the fact that they PersistableQueryParams, as these are set by the Okta SDK sign in method
			// and subsequent interception, and not by gateway
			const appClientId1 = 'appClientId1';
			const fromURI1 = 'fromURI1';

			cy.visit(
				`/register/email?returnUrl=${encodedReturnUrl}&appClientId=${appClientId1}&fromURI=${fromURI1}`,
			);

			const timeRequestWasMade = new Date();
			cy.get('input[name=email]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Check your email inbox');
			cy.contains(unregisteredEmail);
			cy.contains('send again');
			cy.contains('try another address');

			cy.checkForEmailAndGetDetails(
				unregisteredEmail,
				timeRequestWasMade,
				/welcome\/([^"]*)/,
			).then(({ body, token }) => {
				expect(body).to.have.string('Complete registration');
				// should contain these params instead
				const appClientId2 = 'appClientId2';
				const fromURI2 = 'fromURI2';
				cy.visit(
					`/welcome/${token}&appClientId=${appClientId2}&fromURI=${fromURI2}`,
				);
				cy.contains('Complete creating account');
				cy.url()
					.should('contain', appClientId2)
					.and('contain', fromURI2)
					.and('not.contain', appClientId1)
					.and('not.contain', fromURI1);

				cy.get('form')
					.should('have.attr', 'action')
					.and('match', new RegExp(appClientId2))
					.and('match', new RegExp(fromURI2))
					.and('not.match', new RegExp(appClientId1))
					.and('not.match', new RegExp(fromURI1));
			});
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

						cy.contains('Check your email inbox');
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

						cy.contains('Check your email inbox');
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

							cy.contains('Check your email inbox');
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
							cy.contains('Reset password');
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

						cy.contains('Check your email inbox');
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
							cy.contains('Reset password');
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

						cy.contains('Check your email inbox');
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
							cy.contains('Reset password');
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

							cy.contains('Check your email inbox');
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
								cy.contains('Reset password');
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

							cy.contains('Check your email inbox');
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
								cy.contains('Reset password');
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
