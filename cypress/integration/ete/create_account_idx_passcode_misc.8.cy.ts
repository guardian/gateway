import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';

const breachCheck = () => {
	cy.intercept({
		method: 'GET',
		url: 'https://api.pwnedpasswords.com/range/*',
	}).as('breachCheck');
};

describe('Create account flow - misc tests', () => {
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

	context('Extra checks', () => {
		it('should navigate back to the correct page when change email is clicked', () => {
			cy.visit('/register/email-sent');
			cy.contains('try another address').click();
			cy.contains('Create your account');
			cy.title().should('eq', 'Register With Email | The Guardian');
		});

		it('should render properly if the encrypted email cookie is not set', () => {
			cy.visit('/register/email-sent');
			cy.contains('try another address');
			cy.contains('Check your inbox');
		});

		it('shows reCAPTCHA errors when the request fails', () => {
			cy.setCookie('cypress-mock-state', '1'); // passcode send again timer
			cy
				.createTestUser({
					isUserEmailValidated: false,
				})
				?.then(({ emailAddress }) => {
					cy.visit('/register/email');
					cy.get('input[name=email]').type(emailAddress);

					const timeRequestWasMadeInitialEmail = new Date();

					cy.get('[data-cy="main-form-submit-button"]').click();

					cy.contains('Enter your code');
					cy.contains(emailAddress);
					cy.contains('send again');
					cy.contains('try another address');

					cy.checkForEmailAndGetDetails(
						emailAddress,
						timeRequestWasMadeInitialEmail,
					);

					cy.interceptRecaptcha();
					cy.wait(1000); // wait for the send again button to be enabled
					cy.contains('send again').click();
					cy.contains('Google reCAPTCHA verification failed.');
					cy.contains('If the problem persists please try the following:');

					const timeRequestWasMade = new Date();
					cy.wait(1000); // wait for the send again button to be enabled
					cy.contains('send again').click();

					cy.contains('Google reCAPTCHA verification failed.').should(
						'not.exist',
					);

					cy.contains('Enter your code');
					cy.contains(emailAddress);

					cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade);
				});
		});

		it('persists the clientId when navigating away', () => {
			cy.visit('/register?clientId=jobs');
			cy.contains('Sign in').click();
			cy.url().should('contain', 'clientId=jobs');
		});

		it('does not proceed when no email provided', () => {
			cy.visit('/register/email');
			cy.get('[data-cy="main-form-submit-button"]').click();
			// check that form isn't submitted
			cy.url().should('not.contain', 'returnUrl');
			cy.contains('Please enter your email.');
		});

		it('does not proceed when invalid email provided', () => {
			cy.visit('/register/email');
			const invalidEmail = 'invalid.email.com';
			cy.get('input[name=email]').type(invalidEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();
			// check that form isn't submitted
			cy.url().should('not.contain', 'returnUrl');
			cy.contains('Please enter a valid email format.');
		});

		it('Continue with Google button links to /signin/google', () => {
			cy.visit('/register');
			cy.contains('Continue with Google')
				.should('have.attr', 'href')
				.and('include', '/signin/google');
		});

		it('Continue with Apple button links to /signin/apple', () => {
			cy.visit('/register');
			cy.contains('Continue with Apple')
				.should('have.attr', 'href')
				.and('include', '/signin/apple');
		});

		it('Continue with Email button links to /register/email', () => {
			cy.visit('/register');
			cy.contains('Continue with email')
				.should('have.attr', 'href')
				.and('include', '/register/email');
		});

		it('links to the Google terms of service page', () => {
			const googleTermsUrl = 'https://policies.google.com/terms';
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			cy.intercept('GET', googleTermsUrl, (req) => {
				req.reply(200);
			});
			cy.visit('/register/email');
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
			cy.visit('/register/email');
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
			cy.visit('/register');
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
			cy.visit('/register');
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
			cy.visit('/register?clientId=jobs');
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
			cy.visit('/register?clientId=jobs');
			cy.contains('For information about how we use your data')
				.contains('Guardian Jobs privacy policy')
				.click();
			cy.url().should('eq', guardianJobsPrivacyPolicyUrl);
		});

		it('persists the clientId when navigating away', () => {
			cy.visit('/register?clientId=jobs');
			cy.contains('Sign in').click();
			cy.url().should('contain', 'clientId=jobs');
		});

		it('does not proceed when no email provided', () => {
			cy.visit('/register/email');
			cy.get('[data-cy="main-form-submit-button"]').click();
			// check that form isn't submitted
			cy.url().should('not.contain', 'returnUrl');
			cy.contains('Please enter your email.');
		});
	});
});
