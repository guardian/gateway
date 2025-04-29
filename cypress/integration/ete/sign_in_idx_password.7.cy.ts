import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';

describe('Okta IDX API Sign In with Password', () => {
	const returnUrl =
		'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';

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

					cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
						({ body, codes }) => {
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
							cy.contains('Submit verification code');
							cy.get('input[name=code]').clear().type(code!);

							cy.url().should('contain', '/set-password');

							cy.get('input[name="password"]').type(randomPassword());
							cy.get('button[type="submit"]').click();

							cy.url().should('contain', '/set-password/complete');
						},
					);
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
