import { Status } from '../../../src/server/models/okta/User';

describe('Create Account - Okta Classic (useOktaClassic)', () => {
	context(
		'Existing users asking for an email to be resent after attempting to register with Okta - useOktaClassic',
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

							cy.visit('/register/email?useOktaClassic=true');

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

								cy.visit('/register/email?useOktaClassic=true');

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

							cy.visit('/register/email?useOktaClassic=true');
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

								cy.visit('/register/email?useOktaClassic=true');
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

								cy.visit('/register/email?useOktaClassic=true');
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
			});
		},
	);

	context(
		'Existing users attempting to register with Okta - useOktaClassic',
		() => {
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

							cy.visit('/register/email?useOktaClassic=true');
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
								`/register/email?appClientId=${appClientId}&fromURI=${fromURI}&useOktaClassic=true`,
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

								cy.visit('/register/email?useOktaClassic=true');
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

							cy.visit('/register/email?useOktaClassic=true');
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

							cy.visit('/register/email?useOktaClassic=true');
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
								`/register/email?appClientId=${appClientId}&fromURI=${fromURI}&useOktaClassic=true`,
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

								cy.visit('/register/email?useOktaClassic=true');
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

								cy.visit('/register/email?useOktaClassic=true');
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

								cy.visit('/register/email?useOktaClassic=true');

								cy.get('input[name=email]').type(emailAddress);
								cy.get('[data-cy="main-form-submit-button"]').click();

								cy.contains(
									'There was a problem registering, please try again.',
								);
							});
						});
					});
			});
		},
	);
});
