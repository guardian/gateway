import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';

describe('Sign In flow, with passcode (part 1)', () => {
	// set up useful variables
	const returnUrl =
		'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';
	const encodedReturnUrl = encodeURIComponent(returnUrl);
	const appClientId = 'appClientId1';
	const fromURI = '/oauth2/v1/authorize';

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
			cy.createTestUser({
				isUserEmailValidated: true,
			})?.then(({ emailAddress }) => {
				cy.sendEmailAndValidatePasscode({
					emailAddress,
				});
			});
		});

		it('should sign in with passocde - preserve returnUrl', () => {
			cy.createTestUser({
				isUserEmailValidated: true,
			})?.then(({ emailAddress }) => {
				cy.sendEmailAndValidatePasscode({
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
				cy.sendEmailAndValidatePasscode({
					emailAddress,
					expectedReturnUrl: fromURI,
					params: `fromURI=${fromURI}&appClientId=${appClientId}`,
				});
			});
		});

		it('selects password option to sign in from initial sign in page', () => {
			cy.createTestUser({
				isUserEmailValidated: true,
			})?.then(({ emailAddress, finalPassword }) => {
				cy.visit(`/signin`);
				cy.get('input[name=email]').type(emailAddress);

				cy.contains('Sign in with a password instead').click();

				// password page
				cy.url().should('include', '/signin/password');
				cy.get('input[name=email]').should('have.value', emailAddress);
				cy.get('input[name=password]').type(finalPassword);
				cy.get('[data-cy="main-form-submit-button"]').click();
				cy.url().should('include', 'https://m.code.dev-theguardian.com/');
			});
		});

		it('selects password option to sign in from the initial sign in page and show correct error page on incorrect password', () => {
			const emailAddress = randomMailosaurEmail();
			cy.visit(`/signin`);
			cy.get('input[name=email]').type(emailAddress);
			cy.contains('Sign in with a password instead').click();

			// password page
			cy.url().should('include', '/signin/password');
			cy.get('input[name=email]').should('have.value', emailAddress);
			cy.get('input[name=password]').type(randomPassword());
			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.url().should('include', '/signin/password');
			cy.contains('Email and password don’t match');
		});

		it('selects password option to sign in from passcode page', () => {
			cy.createTestUser({
				isUserEmailValidated: true,
			})?.then(({ emailAddress, finalPassword }) => {
				cy.visit(`/signin?usePasscodeSignIn=true`);
				cy.get('input[name=email]').type(emailAddress);
				cy.get('[data-cy="main-form-submit-button"]').click();

				// passcode page
				cy.url().should('include', '/signin/code');
				cy.contains('Enter your one-time code');
				cy.contains('sign in with a password instead').click();

				// password page
				cy.url().should('include', '/signin/password');
				cy.get('input[name=email]').should('have.value', emailAddress);
				cy.get('input[name=password]').type(finalPassword);
				cy.get('[data-cy="main-form-submit-button"]').click();
				cy.url().should('include', 'https://m.code.dev-theguardian.com/');
			});
		});

		it.only('selects password option to sign in from passcode page and show correct error page on incorrect password', () => {
			const emailAddress = randomMailosaurEmail();
			cy.visit(`/signin`);
			cy.get('input[name=email]').type(emailAddress);
			cy.get('[data-cy="main-form-submit-button"]').click();
			// passcode page
			cy.url().should('include', '/signin/code');
			cy.contains('Enter your one-time code');
			cy.contains('sign in with a password instead').click();

			// password page
			cy.url().should('include', '/signin/password');
			cy.get('input[name=email]').should('have.value', emailAddress);
			cy.get('input[name=password]').type(randomPassword());
			cy.get('[data-cy="main-form-submit-button"]').click();
			cy.url().should('include', '/signin/password');
			cy.contains('Email and password don’t match');
		});

		it('should sign in with passcode - resend email', () => {
			cy.createTestUser({
				isUserEmailValidated: true,
			})?.then(({ emailAddress }) => {
				cy.sendEmailAndValidatePasscode({
					emailAddress,
					additionalTests: 'resend-email',
				});
			});
		});

		it('should sign in with passcode - change email', () => {
			cy.createTestUser({
				isUserEmailValidated: true,
			})?.then(({ emailAddress }) => {
				cy.sendEmailAndValidatePasscode({
					emailAddress,
					additionalTests: 'change-email',
				});
			});
		});

		it('should sign in with passcode - passcode incorrect', () => {
			cy.createTestUser({
				isUserEmailValidated: true,
			})?.then(({ emailAddress }) => {
				cy.sendEmailAndValidatePasscode({
					emailAddress,
					additionalTests: 'passcode-incorrect',
				});
			});
		});

		it('should redirect with error when multiple passcode attempts fail', () => {
			cy.createTestUser({
				isUserEmailValidated: true,
			})?.then(({ emailAddress }) => {
				cy.visit(`/signin?usePasscodeSignIn=true`);
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
						cy.url().should('include', '/signin/code');
						cy.contains('Enter your one-time code');

						// attempt 1
						cy.contains('Submit verification code');
						cy.get('input[name=code]').type(`${+code! + 1}`);
						cy.url().should('include', '/signin/code');
						cy.contains('Incorrect code');

						// attempt 2
						cy.get('input[name=code]').type(`${+code! + 1}`);
						cy.contains('Submit verification code').click();
						cy.url().should('include', '/signin/code');
						cy.contains('Incorrect code');

						// attempt 3
						cy.get('input[name=code]').type(`${+code! + 1}`);
						cy.contains('Submit verification code').click();
						cy.url().should('include', '/signin/code');
						cy.contains('Incorrect code');

						// attempt 4
						cy.get('input[name=code]').type(`${+code! + 1}`);
						cy.contains('Submit verification code').click();
						cy.url().should('include', '/signin/code');
						cy.contains('Incorrect code');

						// attempt 5
						cy.get('input[name=code]').type(`${+code! + 1}`);
						cy.contains('Submit verification code').click();
						cy.url().should('include', '/signin');
						cy.contains('Your code has expired');
					},
				);
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

			cy.contains('Enter your one-time code');
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
						cy.sendEmailAndValidatePasscode({
							emailAddress,
							expectedEmailBody: 'Your verification code',
						});
					});
				},
			);
		});
	});
});
