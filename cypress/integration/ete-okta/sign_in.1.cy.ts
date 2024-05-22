import * as SignIn from '../shared/sign_in.shared';

describe('Sign in flow, Okta enabled', () => {
	context('Terms and Conditions links', () => {
		it(...SignIn.linksToTheGoogleTermsOfServicePage());
		it(...SignIn.linksToTheGooglePrivacyPolicyPage());
		it(...SignIn.linksToTheGuardianTermsAndConditionsPage());
		it(...SignIn.linksToTheGuardianPrivacyPolicyPage());
		it(
			...SignIn.linksToTheGuardianJobsTermsAndConditionsPageWhenJobsClientIdSet(),
		);
		it(...SignIn.linksToTheGuardianJobsPrivacyPolicyPageWhenJobsClientIdSet());
	});

	it(...SignIn.persistsTheClientIdWhenNavigatingAway());
	it(...SignIn.appliesFormValidationToEmailAndPasswordInputFields());
	it(...SignIn.showsAMessageWhenCredentialsAreInvalid());
	it(...SignIn.correctlySignsInAnExistingUser());
	it(...SignIn.navigatesToResetPassword());
	it(...SignIn.navigatesToRegistration());
	it(...SignIn.respectsTheReturnUrlQueryParam());
	it(...SignIn.removesEncryptedEmailParameterFromQueryString());
	it(
		...SignIn.removesEncryptedEmailParameterAndPreservesAllOtherValidParameters(),
	);
	it(
		...SignIn.showsRecaptchaErrorsWhenTheUserTriesToSignInOfflineAndAllowsSignInWhenBackOnline(),
	);
	it(...SignIn.hitsAccessTokenRateLimitAndRecoversTokenAfterTimeout());

	it(...SignIn.redirectsCorrectlyForSocialSignIn());
	it(
		...SignIn.showsAnErrorMessageAndInformationParagraphWhenAccountLinkingRequiredErrorParameterIsPresent(),
	);
	it(
		...SignIn.doesNotDisplaySocialButtonsWhenAccountLinkingRequiredErrorParameterIsPresent(),
	);

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
							)}`,
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
	context('Okta session refresh', () => {
		it('refreshes a valid Okta session', () => {
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
						)}`,
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
		it('sends a client without the Okta cookie to the redirectUrl', () => {
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

					// Delete the Okta idx cookie
					cy.clearCookie('idx', {
						domain: Cypress.env('BASE_URI'),
					});

					// Visit the refresh endpoint
					cy.visit(
						`/signin/refresh?returnUrl=${encodeURIComponent(
							`https://${Cypress.env('BASE_URI')}/reset-password`,
						)}`,
					);
					cy.url().should('include', '/reset-password');

					cy.getCookie('idx').should('not.exist');
				},
			);
		});
		it('sends a client with neither Okta nor Identity cookies to /signin', () => {
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
						)}`,
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

	context('Okta unvalidated email flow', () => {
		it('Sends a user with an unvalidated email a reset password email on sign in', () => {
			cy
				.createTestUser({
					isUserEmailValidated: false,
				})
				?.then(({ emailAddress, finalPassword }) => {
					const timeRequestWasMade = new Date();
					cy.visit('/signin');
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
							cy.contains('Reset password');
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
								)}/consents/data`;
								const visitUrl = `/signin?returnUrl=${encodeURIComponent(
									postSignInReturnUrl,
								)}`;
								cy.visit(visitUrl);
								cy.get('input[name=email]').type(emailAddress);
								cy.get('input[name=password]').type(finalPassword);
								cy.get('[data-cy="main-form-submit-button"]').click();
								cy.url().should('include', '/consents/data');
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
