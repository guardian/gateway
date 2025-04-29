describe('Okta Classic API Sign In', () => {
	const returnUrl =
		'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';

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
