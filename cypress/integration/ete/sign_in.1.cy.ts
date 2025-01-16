import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';

const returnUrl =
	'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';

describe('Sign in flow, Okta enabled', () => {
	context('Page tests', () => {
		it('links to the Google terms of service page', () => {
			const googleTermsUrl = 'https://policies.google.com/terms';
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', googleTermsUrl, (req) => {
				req.reply(200);
			});
			cy.visit('/signin');
			cy.contains('terms of service').click();
			cy.url().should('eq', googleTermsUrl);
		});
		it('links to the Google privacy policy page', () => {
			const googlePrivacyPolicyUrl = 'https://policies.google.com/privacy';
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', googlePrivacyPolicyUrl, (req) => {
				req.reply(200);
			});
			cy.visit('/signin');
			cy.contains('This service is protected by reCAPTCHA and the Google')
				.contains('privacy policy')
				.click();
			cy.url().should('eq', googlePrivacyPolicyUrl);
		});
		it('links to the Guardian terms and conditions page', () => {
			const guardianTermsOfServiceUrl =
				'https://www.theguardian.com/help/terms-of-service';
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', guardianTermsOfServiceUrl, (req) => {
				req.reply(200);
			});
			cy.visit('/signin');
			cy.contains('terms and conditions').click();
			cy.url().should('eq', guardianTermsOfServiceUrl);
		});
		it('links to the Guardian privacy policy page', () => {
			const guardianPrivacyPolicyUrl =
				'https://www.theguardian.com/help/privacy-policy';
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', guardianPrivacyPolicyUrl, (req) => {
				req.reply(200);
			});
			cy.visit('/signin');
			cy.contains('For information about how we use your data')
				.contains('privacy policy')
				.click();
			cy.url().should('eq', guardianPrivacyPolicyUrl);
		});
		it('links to the Guardian jobs terms and conditions page when jobs clientId set', () => {
			const guardianJobsTermsOfServiceUrl =
				'https://jobs.theguardian.com/terms-and-conditions/';
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', guardianJobsTermsOfServiceUrl, (req) => {
				req.reply(200);
			});
			cy.visit('/signin?clientId=jobs');
			cy.contains('Guardian Jobs terms and conditions').click();
			cy.url().should('eq', guardianJobsTermsOfServiceUrl);
		});
		it('links to the Guardian jobs privacy policy page when jobs clientId set', () => {
			const guardianJobsPrivacyPolicyUrl =
				'https://jobs.theguardian.com/privacy-policy/';
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', guardianJobsPrivacyPolicyUrl, (req) => {
				req.reply(200);
			});
			cy.visit('/signin?clientId=jobs');
			cy.contains('For information about how we use your data')
				.contains('Guardian Jobs privacy policy')
				.click();
			cy.url().should('eq', guardianJobsPrivacyPolicyUrl);
		});
		it('navigates to reset password', () => {
			cy.visit('/signin?usePasswordSignIn=true');
			cy.contains('Reset password').click();
			cy.contains('Reset password');
		});
		it('navigates to registration', () => {
			cy.visit('/signin');
			cy.contains('Create a free account').click();
			cy.contains('Continue with Google');
			cy.contains('Continue with Apple');
			cy.contains('Continue with email');
		});
		it('removes encryptedEmail parameter from query string', () => {
			const encryptedEmailParam = 'encryptedEmail=bhvlabgflbgyil';
			cy.visit(`/signin?${encryptedEmailParam}`);

			cy.location('search').should('not.contain', encryptedEmailParam);
		});
		it('removes encryptedEmail parameter and preserves all other valid parameters', () => {
			const encryptedEmailParam = 'encryptedEmail=bhvlabgflbgyil';
			cy.visit(
				`/signin?returnUrl=${encodeURIComponent(
					returnUrl,
				)}&${encryptedEmailParam}&refViewId=12345`,
			);

			cy.location('search').should('not.contain', encryptedEmailParam);
			cy.location('search').should('contain', 'refViewId=12345');
			cy.location('search').should('contain', encodeURIComponent(returnUrl));
		});
		it('persists the clientId when navigating away', () => {
			cy.visit('/signin?clientId=jobs');
			cy.contains('Create a free account').click();
			cy.url().should('contain', 'clientId=jobs');
		});
		it('applies form validation to email and password input fields', () => {
			cy.visit('/signin?usePasswordSignIn=true');

			cy.get('form').within(() => {
				cy.get('input:invalid').should('have.length', 2);
				cy.get('input[name=email]').type('not an email');
				cy.get('input:invalid').should('have.length', 2);
				cy.get('input[name=email]').type('emailaddress@inavalidformat.com');
				cy.get('input:invalid').should('have.length', 1);
				cy.get('input[name=password]').type('password');
				cy.get('input:invalid').should('have.length', 0);
			});
		});
	});

	context('Okta Classic API Sign In', () => {
		it('shows a message when credentials are invalid', () => {
			cy.visit('/signin?useOktaClassic=true');
			cy.get('input[name=email]').type('invalid@doesnotexist.com');
			cy.get('input[name=password]').type('password');
			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.contains('Email and password don’t match');
		});

		it('correctly signs in an existing user', () => {
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
				req.reply(200);
			});
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress, finalPassword }) => {
					cy.visit('/signin?useOktaClassic=true');
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.url().should('include', 'https://m.code.dev-theguardian.com/');
				});
		});

		it('respects the returnUrl query param', () => {
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', returnUrl, (req) => {
				req.reply(200);
			});
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress, finalPassword }) => {
					cy.visit(
						`/signin?returnUrl=${encodeURIComponent(returnUrl)}&useOktaClassic=true`,
					);
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.url().should('eq', returnUrl);
				});
		});

		it('hits access token rate limit and recovers token after timeout', () => {
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
				req.reply(200);
			});
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress, finalPassword }) => {
					cy.visit('/signin?useOktaClassic=true');
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.url().should('include', 'https://m.code.dev-theguardian.com/');

					// We visit reauthenticate here because if we visit /signin or
					// /register, the logged in user guard will redirect us away before
					// the ratelimiter has a chance to work
					cy.visit('/reauthenticate');
					cy.contains('Sign');
					Cypress._.times(6, () => cy.reload());
					cy.contains('Rate limit exceeded');
				});
		});

		it('Sends a user with an unvalidated email a reset password email on sign in', () => {
			cy
				.createTestUser({
					isUserEmailValidated: false,
				})
				?.then(({ emailAddress, finalPassword }) => {
					const timeRequestWasMade = new Date();
					cy.visit('/signin?useOktaClassic=true');
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.url().should('include', '/signin/email-sent');
					cy.contains(
						'For security reasons we need you to change your password.',
					);
					cy.contains(emailAddress);
					cy.contains('send again');
					cy.contains('try another address');

					// Ensure the user's authentication cookies are not set
					cy.getCookie('idx').then((idxCookie) => {
						expect(idxCookie).to.not.exist;

						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade,
							/reset-password\/([^"]*)/,
						).then(({ links, body, token }) => {
							expect(body).to.have.string(
								'Because your security is extremely important to us, we have changed our password policy.',
							);
							expect(body).to.have.string('Reset password');
							expect(links.length).to.eq(2);
							const resetPasswordLink = links.find((s) =>
								s.text?.includes('Reset password'),
							);
							expect(resetPasswordLink?.href ?? '').to.have.string(
								'reset-password',
							);
							cy.visit(`/reset-password/${token}`);
							cy.contains(emailAddress);
							cy.contains('Create new password');
						});
					});
				});
		});

		it('sets emailValidated flag on oauth callback', () => {
			// this is a specific test case for new user registrations in Okta
			// In Okta new social registered users are added to the GuardianUser-EmailValidated group
			// by default, but the custom emailValidated field is not defined/set to false
			// this causes problems in legacy code, where the emailValidated flag is not set but the group is
			// so we need to set the flag to true when the user is added to the group
			// we do this on the oauth callback route /oauth/authorization-code/callback
			// where we update the user profile with the emailValidated flag if the user is in the GuardianUser-EmailValidated group but the emailValidated is falsy

			// This test checks this behaviour by first getting a user into this state
			// i.e user.profile.emailValidated = false, and user groups has GuardianUser-EmailValidated

			// first we have to get the id of the GuardianUser-EmailValidated group
			cy.findEmailValidatedOktaGroupId().then((groupId) => {
				// next we create a test user
				cy.createTestUser({}).then(({ emailAddress, finalPassword }) => {
					// we get the user profile object from Okta
					cy.getTestOktaUser(emailAddress).then((user) => {
						const { id, profile } = user;
						// check the user profile has the emailValidated flag set to false
						expect(profile.emailValidated).to.be.false;
						// next check the user groups
						cy.getOktaUserGroups(id).then((groups) => {
							// make sure the user is not in the GuardianUser-EmailValidated group
							const group = groups.find((g) => g.id === groupId);
							expect(group).not.to.exist;

							// and add them to the group if this is the case
							cy.addOktaUserToGroup(id, groupId);

							// at this point the user is in the correct state
							// so we attempt to sign them in
							cy.visit(
								`/signin?returnUrl=${encodeURIComponent(
									`https://${Cypress.env('BASE_URI')}/welcome/review`,
								)}&usePasswordSignIn=true`,
							);
							cy.get('input[name=email]').type(emailAddress);
							cy.get('input[name=password]').type(finalPassword);
							cy.get('[data-cy="main-form-submit-button"]').click();
							cy.url().should('include', '/welcome/review');

							// at this point the oauth callback route will have run, so we can recheck the user profile to see if the emailValidated flag has been set
							cy.getTestOktaUser(id).then((user) => {
								const { profile } = user;
								expect(profile.emailValidated).to.be.true;
							});

							// and the user should also be in the group
							cy.getOktaUserGroups(id).then((groups) => {
								const group = groups.find((g) => g.id === groupId);
								expect(group).to.exist;
							});
						});
					});
				});
			});
		});
	});

	context('Okta IDX API Sign In with Password', () => {
		it('ACTIVE user - email + password authenticators - successfully sign in', () => {
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
				req.reply(200);
			});
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress, finalPassword }) => {
					cy.visit('/signin?usePasswordSignIn=true');
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.url().should('include', 'https://m.code.dev-theguardian.com/');
				});
		});

		it('ACTIVE user - email + password authenticators - successfully sign in - preserve returnUrl', () => {
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', returnUrl, (req) => {
				req.reply(200);
			});
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress, finalPassword }) => {
					cy.visit(
						`/signin?returnUrl=${encodeURIComponent(returnUrl)}&usePasswordSignIn=true`,
					);
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.url().should('eq', returnUrl);
				});
		});

		it('ACTIVE user - email + password authenticators - successfully sign in - preserve fromURI', () => {
			const encodedReturnUrl = encodeURIComponent(returnUrl);
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

			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress, finalPassword }) => {
					cy.visit(
						`/signin?returnUrl=${encodeURIComponent(returnUrl)}&usePasswordSignIn=true`,
					);
					cy.visit(
						`/signin?returnUrl=${encodedReturnUrl}&appClientId=${appClientId}&fromURI=${fromURI}&usePasswordSignIn=true`,
					);
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();

					// fromURI redirect
					cy.url().should('contain', decodeURIComponent(fromURI));
				});
		});

		it('ACTIVE user - password authenticator only - send OTP reset password security email', () => {
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

						// setup complete, now sign in
						cy.visit('/signin?usePasswordSignIn=true');
						cy.contains('Sign in with a different email').click();
						cy.get('input[name=email]').clear().type(emailAddress);
						cy.get('input[name=password]').type(password);

						const timeRequestWasMade = new Date();
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
							cy.url().should('include', '/signin/email-sent');
							cy.contains('Enter your verification code');
							cy.contains(
								'For security reasons we need you to change your password.',
							);
							cy.get('input[name=code]').clear().type(code!);
							cy.contains('Submit verification code').click();

							cy.url().should('contain', '/set-password');

							cy.get('input[name="password"]').type(randomPassword());
							cy.get('button[type="submit"]').click();

							cy.url().should('contain', '/set-password/complete');
						});
					});
				},
			);
		});

		it('ACTIVE user - email + password authenticators - shows authentication error when password incorrect', () => {
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
				req.reply(200);
			});
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress, finalPassword }) => {
					cy.visit('/signin?usePasswordSignIn=true');
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(`${finalPassword}!`);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.contains('Email and password don’t match');
				});
		});

		it('NON-EXISTENT user - shows authentication error in all scenarios', () => {
			cy.visit('/signin?usePasswordSignIn=true');
			cy.get('input[name=email]').type('invalid@doesnotexist.com');
			cy.get('input[name=password]').type('password');
			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.contains('Email and password don’t match');
		});

		it('NON-ACTIVE user -  shows authentication error', () => {
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
				req.reply(200);
			});
			cy
				.createTestUser({ isGuestUser: true })
				?.then(({ emailAddress, finalPassword }) => {
					cy.visit('/signin?usePasswordSignIn=true');
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(`${finalPassword}`);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.contains('Email and password don’t match');
				});
		});

		it('SOCIAL user - sets emailValidated flag on oauth callback', () => {
			// this is a specific test case for new user registrations in Okta
			// In Okta new social registered users are added to the GuardianUser-EmailValidated group
			// by default, but the custom emailValidated field is not defined/set to false
			// this causes problems in legacy code, where the emailValidated flag is not set but the group is
			// so we need to set the flag to true when the user is added to the group
			// we do this on the oauth callback route /oauth/authorization-code/callback
			// where we update the user profile with the emailValidated flag if the user is in the GuardianUser-EmailValidated group but the emailValidated is falsy

			// This test checks this behaviour by first getting a user into this state
			// i.e user.profile.emailValidated = false, and user groups has GuardianUser-EmailValidated

			// first we have to get the id of the GuardianUser-EmailValidated group
			cy.findEmailValidatedOktaGroupId().then((groupId) => {
				// next we create a test user
				cy.createTestUser({}).then(({ emailAddress, finalPassword }) => {
					// we get the user profile object from Okta
					cy.getTestOktaUser(emailAddress).then((user) => {
						const { id, profile } = user;
						// check the user profile has the emailValidated flag set to false
						expect(profile.emailValidated).to.be.false;
						// next check the user groups
						cy.getOktaUserGroups(id).then((groups) => {
							// make sure the user is not in the GuardianUser-EmailValidated group
							const group = groups.find((g) => g.id === groupId);
							expect(group).not.to.exist;

							// and add them to the group if this is the case
							cy.addOktaUserToGroup(id, groupId);

							// at this point the user is in the correct state
							// so we attempt to sign them in
							cy.visit(
								`/signin?returnUrl=${encodeURIComponent(
									`https://${Cypress.env('BASE_URI')}/welcome/review`,
								)}&usePasswordSignIn=true`,
							);
							cy.get('input[name=email]').type(emailAddress);
							cy.get('input[name=password]').type(finalPassword);
							cy.get('[data-cy="main-form-submit-button"]').click();
							cy.url().should('include', '/welcome/review');

							// at this point the oauth callback route will have run, so we can recheck the user profile to see if the emailValidated flag has been set
							cy.getTestOktaUser(id).then((user) => {
								const { profile } = user;
								expect(profile.emailValidated).to.be.true;
							});

							// and the user should also be in the group
							cy.getOktaUserGroups(id).then((groups) => {
								const group = groups.find((g) => g.id === groupId);
								expect(group).to.exist;
							});
						});
					});
				});
			});
		});

		it('shows reCAPTCHA errors when the user tries to sign in offline and allows sign in when back online', () => {
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
				req.reply(200);
			});
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress, finalPassword }) => {
					cy.visit('/signin?usePasswordSignIn=true');

					cy.interceptRecaptcha();

					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();

					cy.contains('Google reCAPTCHA verification failed.');
					cy.contains('If the problem persists please try the following:');

					cy.get('[data-cy="main-form-submit-button"]').click();

					cy.contains('Google reCAPTCHA verification failed.').should(
						'not.exist',
					);

					cy.url().should('include', 'https://m.code.dev-theguardian.com/');
				});
		});
	});

	context('Social sign in', () => {
		it('redirects correctly for social sign in', () => {
			cy.visit(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
			cy.get('[data-cy="google-sign-in-button"]').should(
				'have.attr',
				'href',
				`/signin/google?returnUrl=${encodeURIComponent(returnUrl)}`,
			);
			cy.get('[data-cy="apple-sign-in-button"]').should(
				'have.attr',
				'href',
				`/signin/apple?returnUrl=${encodeURIComponent(returnUrl)}`,
			);
		});
		it('shows an error message and information paragraph when accountLinkingRequired error parameter is present', () => {
			cy.visit('/signin?error=accountLinkingRequired');
			cy.contains(
				'We could not sign you in with your social account credentials. Please sign in with your email below.',
			);
			cy.contains('Social sign-in unsuccessful');
		});
		it('does not display social buttons when accountLinkingRequired error parameter is present', () => {
			cy.visit('/signin?error=accountLinkingRequired');
			cy.get('[data-cy="google-sign-in-button"]').should('not.exist');
			cy.get('[data-cy="apple-sign-in-button"]').should('not.exist');
		});
	});

	context('Okta session refresh', () => {
		it('refreshes a valid Okta session', () => {
			// Create a validated test user
			cy.createTestUser({ isUserEmailValidated: true }).then(
				({ emailAddress, finalPassword }) => {
					// Sign our new user in
					cy.visit(
						`/signin?returnUrl=${encodeURIComponent(
							`https://${Cypress.env('BASE_URI')}/welcome/review`,
						)}&usePasswordSignIn=true`,
					);
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.url().should('include', '/welcome/review');

					// Get the current session data
					cy.getCookie('idx').then((orignalIdxCookie) => {
						expect(orignalIdxCookie).to.exist;
						// we want to check the cookie is being set as a persistent cookie and not a session cookie, hence the expiry check
						expect(orignalIdxCookie?.expiry).to.exist;

						// Refresh our user session
						cy.visit(
							`/signin/refresh?returnUrl=${encodeURIComponent(
								`https://${Cypress.env('BASE_URI')}/welcome/review`,
							)}`,
						);
						cy.url().should('include', '/welcome/review');

						// Get the refreshed session data
						cy.getCookie('idx').then((newIdxCookie) => {
							expect(newIdxCookie).to.exist;
							// `idx` cookie doesn't have same value as original when refreshed, which is different to the Okta Classic `idx` cookie
							expect(newIdxCookie?.value).to.not.equal(orignalIdxCookie?.value);
							// we want to check the cookie is being set as a persistent cookie and not a session cookie, hence the expiry check
							expect(newIdxCookie?.expiry).to.exist;
							if (newIdxCookie?.expiry && orignalIdxCookie?.expiry) {
								expect(newIdxCookie?.expiry).to.be.greaterThan(
									orignalIdxCookie?.expiry,
								);
							}
						});
					});
				},
			);
		});
		it('sends a client with the Okta cookie and an invalid Okta session to the redirectUrl', () => {
			// Create a validated test user
			cy.createTestUser({ isUserEmailValidated: true }).then(
				({ emailAddress, finalPassword }) => {
					// Sign our new user in
					cy.visit(
						`/signin?returnUrl=${encodeURIComponent(
							`https://${Cypress.env('BASE_URI')}/welcome/review`,
						)}&usePasswordSignIn=true`,
					);
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.url().should('include', '/welcome/review');

					// Get the current session data
					cy.getCookie('idx').then((idxCookie) => {
						// Close the user's current session in Okta
						cy.closeCurrentOktaSession({
							idx: idxCookie?.value,
						}).then(() => {
							// closeCurrentOktaSession blanked the IDX cookie, so we
							// need to set it back to the old value
							if (idxCookie) {
								cy.setCookie('idx', idxCookie.value, {
									domain: Cypress.env('BASE_URI'),
									hostOnly: true,
									httpOnly: true,
									sameSite: 'no_restriction',
									secure: true,
								});
							} else {
								throw new Error('idx cookie not found');
							}
							// Refresh our user session
							cy.visit(
								`/signin/refresh?returnUrl=${encodeURIComponent(
									`https://${Cypress.env('BASE_URI')}/reset-password`,
								)}`,
							);
							cy.url().should('include', '/reset-password');
						});
					});
				},
			);
		});
		it('sends a client without Okta cookies to /signin', () => {
			// Create a validated test user
			cy.createTestUser({ isUserEmailValidated: true }).then(
				({ emailAddress, finalPassword }) => {
					// Sign our new user in
					cy.visit(
						`/signin?returnUrl=${encodeURIComponent(
							`https://${Cypress.env('BASE_URI')}/welcome/review`,
						)}&usePasswordSignIn=true`,
					);
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.url().should('include', '/welcome/review');

					// Delete all cookies (Okta and IDAPI)
					cy.clearCookies();

					// Visit the refresh endpoint
					cy.visit(
						`/signin/refresh?returnUrl=${encodeURIComponent(
							`https://${Cypress.env('BASE_URI')}/welcome/review`,
						)}`,
					);
					cy.url().should('include', '/signin');

					cy.getCookie('idx').should('not.exist');
					cy.getCookie('sc_gu_u').should('not.exist');
					cy.getCookie('sc_gu_la').should('not.exist');
				},
			);
		});
		it('leaves the last access cookie unchanged when refreshing a valid Okta session', () => {
			// Create a validated test user
			cy.createTestUser({ isUserEmailValidated: true }).then(
				({ emailAddress, finalPassword }) => {
					// Sign our new user in
					cy.visit(
						`/signin?returnUrl=${encodeURIComponent(
							`https://${Cypress.env('BASE_URI')}/welcome/review`,
						)}&usePasswordSignIn=true`,
					);
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.url().should('include', '/welcome/review');

					// Get the current session data
					cy.getCookie('SC_GU_LA').then((originalLastAccessCookie) => {
						cy.getCookie('SC_GU_U').then((originalSecureIdapiCookie) => {
							expect(originalLastAccessCookie).to.exist;
							expect(originalSecureIdapiCookie).to.exist;

							// Refresh our user session
							cy.visit(
								`/signin/refresh?returnUrl=${encodeURIComponent(
									`https://${Cypress.env('BASE_URI')}/welcome/review`,
								)}`,
							);
							cy.url().should('include', '/welcome/review');

							// Expect the last access cookie to be unchanged
							cy.getCookie('SC_GU_LA').then((lastAccessCookie) => {
								expect(lastAccessCookie).to.exist;
								expect(lastAccessCookie?.value).to.equal(
									originalLastAccessCookie?.value,
								);
								expect(lastAccessCookie?.expiry).to.equal(
									originalLastAccessCookie?.expiry,
								);
							});

							// Expect other Idapi cookies to have changed
							cy.getCookie('SC_GU_U').then((secureIdapiCookie) => {
								expect(secureIdapiCookie).to.exist;
								expect(secureIdapiCookie?.value).not.to.equal(
									originalSecureIdapiCookie?.value,
								);
								if (
									secureIdapiCookie?.expiry &&
									originalSecureIdapiCookie?.expiry
								) {
									expect(secureIdapiCookie?.expiry).to.be.greaterThan(
										originalSecureIdapiCookie?.expiry,
									);
								}
							});
						});
					});
				},
			);
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
						)}&usePasswordSignIn=true`,
					);
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					cy.url().should('include', '/welcome/review');

					// Get the current session data
					cy.getCookie('idx').then((originalIdxCookie) => {
						expect(originalIdxCookie).to.exist;

						// Visit sign in again
						cy.visit(
							`/signin?returnUrl=${encodeURIComponent(
								`https://${Cypress.env('BASE_URI')}/welcome/review`,
							)}`,
						);
						cy.url().should('include', '/signin');

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

	context('Okta missing legacyIdentityId', () => {
		it('Adds the missing legacyIdentityId to the user on authentication', () => {
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress, finalPassword }) => {
					cy.getTestOktaUser(emailAddress).then((user) => {
						const originalLegacyIdentityId = user.profile.legacyIdentityId;
						expect(originalLegacyIdentityId).to.not.be.undefined;
						// Remove the legacyIdentityId from the user
						cy.updateOktaTestUserProfile(emailAddress, {
							legacyIdentityId: null,
						}).then(() => {
							cy.getTestOktaUser(emailAddress).then((user) => {
								expect(user.profile.legacyIdentityId).to.be.undefined;
								const postSignInReturnUrl = `https://${Cypress.env(
									'BASE_URI',
								)}/welcome/review`;
								const visitUrl = `/signin?returnUrl=${encodeURIComponent(
									postSignInReturnUrl,
								)}&usePasswordSignIn=true`;
								cy.visit(visitUrl);
								cy.get('input[name=email]').type(emailAddress);
								cy.get('input[name=password]').type(finalPassword);
								cy.get('[data-cy="main-form-submit-button"]').click();
								cy.url().should('include', '/welcome/review');
								cy.getTestOktaUser(emailAddress).then((user) => {
									expect(user.profile.legacyIdentityId).to.eq(
										originalLegacyIdentityId,
									);
								});
							});
						});
					});
				});
		});
	});
});
