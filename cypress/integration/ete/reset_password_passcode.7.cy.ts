import { Status } from '../../../src/server/models/okta/User';
import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';

describe('Password reset recovery flows - with Passcodes', () => {
	context('ACTIVE user with password', () => {
		it('allows the user to change their password', () => {
			const encodedReturnUrl = encodeURIComponent(
				'https://www.theguardian.com/technology/2017/may/04/nier-automata-sci-fi-game-sleeper-hit-designer-yoko-taro',
			);
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';
			const clientId = 'jobs';

			cy.createTestUser({
				isUserEmailValidated: true,
			}).then(({ emailAddress }) => {
				cy.visit(
					`/reset-password?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}`,
				);
				const timeRequestWasMade = new Date();

				cy.contains('Reset password');
				cy.get('input[name=email]').type(emailAddress);
				cy.get('[data-cy="main-form-submit-button"]').click();

				cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
					({ body, codes }) => {
						// email
						expect(body).to.have.string('Your one-time passcode');
						expect(codes?.length).to.eq(1);
						const code = codes?.[0].value;
						expect(code).to.match(/^\d{6}$/);

						// passcode page
						cy.url().should('include', '/reset-password/email-sent');
						cy.contains('Enter your one-time code');
						cy.get('form')
							.should('have.attr', 'action')
							.and('match', new RegExp(encodedReturnUrl))
							.and('match', new RegExp(refViewId))
							.and('match', new RegExp(encodedRef))
							.and('match', new RegExp(clientId));

						cy.contains('Submit one-time code');

						cy.get('input[name=code]').type(code!);

						// password page
						cy.url().should('include', '/reset-password/password');
						cy.get('form')
							.should('have.attr', 'action')
							.and('match', new RegExp(encodedReturnUrl))
							.and('match', new RegExp(refViewId))
							.and('match', new RegExp(encodedRef))
							.and('match', new RegExp(clientId));

						cy.get('input[name="password"]').type(randomPassword());
						cy.get('button[type="submit"]').click();

						// password complete page
						cy.url()
							.should('include', '/reset-password/complete')
							.should('contain', encodedReturnUrl)
							.should('contain', refViewId)
							.should('contain', encodedRef)
							.should('contain', clientId);

						cy.contains('Password updated');
						cy.contains('Continue to the Guardian').should(
							'have.attr',
							'href',
							decodeURIComponent(encodedReturnUrl),
						);
					},
				);
			});
		});

		it('allows the user to change their password - with fromUri', () => {
			const encodedReturnUrl = encodeURIComponent(
				'https://www.theguardian.com/technology/2017/may/04/nier-automata-sci-fi-game-sleeper-hit-designer-yoko-taro',
			);
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';
			const clientId = 'jobs';

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

			cy.createTestUser({
				isUserEmailValidated: true,
			}).then(({ emailAddress }) => {
				cy.visit(
					`/reset-password?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}&appClientId=${appClientId}&fromURI=${fromURI}`,
				);
				const timeRequestWasMade = new Date();

				cy.contains('Reset password');
				cy.get('input[name=email]').type(emailAddress);
				cy.get('[data-cy="main-form-submit-button"]').click();

				cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
					({ body, codes }) => {
						// email
						expect(body).to.have.string('Your one-time passcode');
						expect(codes?.length).to.eq(1);
						const code = codes?.[0].value;
						expect(code).to.match(/^\d{6}$/);

						// passcode page
						cy.url().should('include', '/reset-password/email-sent');
						cy.contains('Enter your one-time code');
						cy.get('form')
							.should('have.attr', 'action')
							.and('match', new RegExp(encodedReturnUrl))
							.and('match', new RegExp(refViewId))
							.and('match', new RegExp(encodedRef))
							.and('match', new RegExp(clientId))
							.and('match', new RegExp(appClientId))
							.and('match', new RegExp(encodeURIComponent(fromURI)));

						cy.contains('Submit one-time code');

						cy.get('input[name=code]').type(code!);

						// password page
						cy.url().should('include', '/reset-password/password');
						cy.get('form')
							.should('have.attr', 'action')
							.and('match', new RegExp(encodedReturnUrl))
							.and('match', new RegExp(refViewId))
							.and('match', new RegExp(encodedRef))
							.and('match', new RegExp(clientId))
							.and('match', new RegExp(appClientId))
							.and('match', new RegExp(encodeURIComponent(fromURI)));

						cy.get('input[name="password"]').type(randomPassword());
						cy.get('button[type="submit"]').click();

						// fromURI redirect
						cy.url().should('contain', decodeURIComponent(fromURI));
					},
				);
			});
		});

		it('passcode incorrect functionality', () => {
			cy.createTestUser({
				isUserEmailValidated: true,
			}).then(({ emailAddress }) => {
				cy.visit(`/reset-password`);

				const timeRequestWasMade = new Date();
				cy.get('input[name=email]').type(emailAddress);
				cy.get('[data-cy="main-form-submit-button"]').click();

				cy.contains('Enter your one-time code');
				cy.contains(emailAddress);
				cy.contains('send again');
				cy.contains('try another address');

				cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
					({ body, codes }) => {
						// email
						expect(body).to.have.string('Your one-time passcode');
						expect(codes?.length).to.eq(1);
						const code = codes?.[0].value;
						expect(code).to.match(/^\d{6}$/);

						// passcode page
						cy.url().should('include', '/reset-password/email-sent');
						cy.contains('Enter your one-time code');
						cy.contains('Submit one-time code');

						cy.get('input[name=code]').type(`${+code! + 1}`);

						cy.url().should('include', '/reset-password/code');

						cy.contains('Incorrect code');

						cy.get('input[name=code]').clear().type(code!);
						cy.contains('Submit one-time code').click();

						cy.url().should('contain', '/reset-password/password');

						cy.get('input[name="password"]').type(randomPassword());
						cy.get('button[type="submit"]').click();

						cy.url().should('contain', '/reset-password/complete');
					},
				);
			});
		});

		it('passcode used functionality', () => {
			cy.createTestUser({
				isUserEmailValidated: true,
			}).then(({ emailAddress }) => {
				cy.visit(`/reset-password`);

				const timeRequestWasMade = new Date();
				cy.get('input[name=email]').type(emailAddress);
				cy.get('[data-cy="main-form-submit-button"]').click();

				cy.contains('Enter your one-time code');
				cy.contains(emailAddress);
				cy.contains('send again');
				cy.contains('try another address');

				cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
					({ body, codes }) => {
						// email
						expect(body).to.have.string('Your one-time passcode');
						expect(codes?.length).to.eq(1);
						const code = codes?.[0].value;
						expect(code).to.match(/^\d{6}$/);

						// passcode page
						cy.url().should('include', '/reset-password/email-sent');
						cy.contains('Enter your one-time code');

						cy.contains('Submit one-time code');
						cy.get('input[name=code]').clear().type(code!);

						cy.url().should('contain', '/reset-password/password');

						cy.go('back');
						cy.url().should('contain', '/reset-password/email-sent');
						cy.contains('Passcode verified');
						cy.contains('Complete setting password').click();

						cy.url().should('contain', '/reset-password/password');

						cy.get('input[name="password"]').type(randomPassword());
						cy.get('button[type="submit"]').click();

						cy.url().should('contain', '/reset-password/complete');
					},
				);
			});
		});

		it('resend email functionality', () => {
			cy.createTestUser({
				isUserEmailValidated: true,
			}).then(({ emailAddress }) => {
				cy.setCookie('cypress-mock-state', '1'); // passcode send again timer
				cy.visit(`/reset-password`);

				const timeRequestWasMade = new Date();
				cy.get('input[name=email]').type(emailAddress);
				cy.get('[data-cy="main-form-submit-button"]').click();

				cy.contains('Enter your one-time code');
				cy.contains(emailAddress);
				cy.contains('send again');
				cy.contains('try another address');

				cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
					({ body, codes }) => {
						// email
						expect(body).to.have.string('Your one-time passcode');
						expect(codes?.length).to.eq(1);
						const code = codes?.[0].value;
						expect(code).to.match(/^\d{6}$/);

						// passcode page
						cy.url().should('include', '/reset-password/email-sent');
						cy.contains('Enter your one-time code');

						// resend email
						const timeRequestWasMade2 = new Date();
						cy.wait(1000); // wait for the send again button to be enabled
						cy.contains('send again').click();

						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade2,
						).then(({ body, codes }) => {
							// email
							expect(body).to.have.string('Your one-time passcode');
							expect(codes?.length).to.eq(1);
							const code = codes?.[0].value;
							expect(code).to.match(/^\d{6}$/);

							// passcode page
							cy.url().should('include', '/reset-password/email-sent');
							cy.contains('Enter your one-time code');

							cy.contains('Submit one-time code');
							cy.get('input[name=code]').clear().type(code!);

							cy.url().should('contain', '/reset-password/password');

							cy.get('input[name="password"]').type(randomPassword());
							cy.get('button[type="submit"]').click();

							cy.url().should('contain', '/reset-password/complete');
						});
					},
				);
			});
		});

		it('change email functionality', () => {
			cy.createTestUser({
				isUserEmailValidated: true,
			}).then(({ emailAddress }) => {
				cy.visit(`/reset-password`);

				const timeRequestWasMade = new Date();
				cy.get('input[name=email]').type(emailAddress);
				cy.get('[data-cy="main-form-submit-button"]').click();

				cy.contains('Enter your one-time code');
				cy.contains(emailAddress);
				cy.contains('send again');
				cy.contains('try another address');

				cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
					({ body, codes }) => {
						// email
						expect(body).to.have.string('Your one-time passcode');
						expect(codes?.length).to.eq(1);
						const code = codes?.[0].value;
						expect(code).to.match(/^\d{6}$/);

						// passcode page
						cy.url().should('include', '/reset-password/email-sent');
						cy.contains('try another address').click();

						cy.url().should('include', '/reset-password');
					},
				);
			});
		});

		it('should redirect with error when multiple passcode attempts fail', () => {
			cy.createTestUser({
				isUserEmailValidated: true,
			})?.then(({ emailAddress }) => {
				cy.visit(`/reset-password`);

				const timeRequestWasMade = new Date();
				cy.get('input[name=email]').type(emailAddress);
				cy.get('[data-cy="main-form-submit-button"]').click();

				cy.contains('Enter your one-time code');
				cy.contains(emailAddress);
				cy.contains('send again');
				cy.contains('try another address');

				cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
					({ body, codes }) => {
						// email
						expect(body).to.have.string('Your one-time passcode');
						expect(codes?.length).to.eq(1);
						const code = codes?.[0].value;
						expect(code).to.match(/^\d{6}$/);

						// passcode page
						cy.url().should('include', '/reset-password/email-sent');
						cy.contains('Enter your one-time code');

						// attempt 1 - auto submit
						cy.contains('Submit one-time code');
						cy.get('input[name=code]').type(`${+code! + 1}`);
						cy.url().should('include', '/reset-password/code');
						cy.contains('Incorrect code');

						// attempt 2 - manual submit
						cy.get('input[name=code]').type(`${+code! + 1}`);
						cy.contains('Submit one-time code').click();
						cy.url().should('include', '/reset-password/code');
						cy.contains('Incorrect code');

						// attempt 3 - manual submit
						cy.get('input[name=code]').type(`${+code! + 1}`);
						cy.contains('Submit one-time code').click();
						cy.url().should('include', '/reset-password/code');
						cy.contains('Incorrect code');

						// attempt 4 - manual submit
						cy.get('input[name=code]').type(`${+code! + 1}`);
						cy.contains('Submit one-time code').click();
						cy.url().should('include', '/reset-password/code');
						cy.contains('Incorrect code');

						// attempt 5 - manual submit
						cy.get('input[name=code]').type(`${+code! + 1}`);
						cy.contains('Submit one-time code').click();
						cy.url().should('include', '/reset-password');
						cy.contains('Your code has expired');
					},
				);
			});
		});

		it('ACTIVE user with only password authenticator - allow the user to change thier password and authenticate', () => {
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
					// we instead reset their password using to set a password
					cy.visit('/reset-password');

					const timeRequestWasMade = new Date();
					cy.get('input[name=email]').clear().type(emailAddress);
					cy.get('[data-cy="main-form-submit-button"]').click();

					cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
						({ body, codes }) => {
							// email
							expect(body).to.have.string('Your verification code');
							expect(codes?.length).to.eq(1);
							const code = codes?.[0].value;
							expect(code).to.match(/^\d{6}$/);

							// passcode page
							cy.url().should('include', '/reset-password/email-sent');
							cy.contains('Enter your one-time code');

							cy.contains('Submit one-time code');
							cy.get('input[name=code]').clear().type(code!);

							cy.url().should('contain', '/set-password');

							cy.get('input[name="password"]').type(randomPassword());
							cy.get('button[type="submit"]').click();

							cy.url().should('contain', '/set-password/complete');
						},
					);
				},
			);
		});
	});

	context('STAGED user', () => {
		it('allows the user to change their password - STAGED - No Passcode Verified', () => {
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

					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.STAGED);
						// make sure we don't use a passcode
						// we instead reset their password using passcodes
						cy.visit('/reset-password');

						const timeRequestWasMade = new Date();
						cy.contains('Reset password');
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
							cy.url().should('include', '/reset-password/email-sent');
							cy.contains('Enter your one-time code');

							cy.contains('Submit one-time code');
							cy.get('input[name=code]').clear().type(code!);

							cy.url().should('contain', '/set-password');

							cy.get('input[name="password"]').type(randomPassword());
							cy.get('button[type="submit"]').click();

							cy.url().should('contain', '/set-password/complete');
						});
					});
				},
			);
		});

		it('allows the user to change their password - STAGED - Created via Classic API (i.e guest user)', () => {
			cy.createTestUser({ isGuestUser: true })?.then(({ emailAddress }) => {
				cy.getTestOktaUser(emailAddress).then((oktaUser) => {
					expect(oktaUser.status).to.eq(Status.STAGED);
					cy.visit('/reset-password');

					const timeRequestWasMade = new Date();
					cy.get('input[name=email]').type(emailAddress);
					cy.get('[data-cy="main-form-submit-button"]').click();

					cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
						({ body, codes }) => {
							// email
							expect(body).to.have.string('Your one-time passcode');
							expect(codes?.length).to.eq(1);
							const code = codes?.[0].value;
							expect(code).to.match(/^\d{6}$/);

							// passcode page
							cy.url().should('include', '/reset-password/email-sent');
							cy.contains('Enter your one-time code');

							cy.contains('Submit one-time code');
							cy.get('input[name=code]').clear().type(code!);

							// password page
							cy.url().should('include', '/reset-password/password');

							cy.get('input[name="password"]').type(randomPassword());
							cy.get('button[type="submit"]').click();

							// password complete page
							cy.url().should('include', '/reset-password/complete');

							cy.contains('Password updated');
						},
					);
				});
			});
		});
	});

	context('PROVISIONED user', () => {
		it('allows the user to change their password - PROVISIONED', () => {
			cy.createTestUser({ isGuestUser: true })?.then(({ emailAddress }) => {
				cy.activateTestOktaUser(emailAddress).then(() => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.PROVISIONED);
						cy.visit('/reset-password');

						const timeRequestWasMade = new Date();
						cy.get('input[name=email]').type(emailAddress);
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade,
						).then(({ body, codes }) => {
							// email
							expect(body).to.have.string('Your one-time passcode');
							expect(codes?.length).to.eq(1);
							const code = codes?.[0].value;
							expect(code).to.match(/^\d{6}$/);

							// passcode page
							cy.url().should('include', '/reset-password/email-sent');
							cy.contains('Enter your one-time code');

							cy.contains('Submit one-time code');
							cy.get('input[name=code]').clear().type(code!);

							// password page
							cy.url().should('include', '/reset-password/password');

							cy.get('input[name="password"]').type(randomPassword());
							cy.get('button[type="submit"]').click();

							// password complete page
							cy.url().should('include', '/reset-password/complete');

							cy.contains('Password updated');
						});
					});
				});
			});
		});
	});

	context('RECOVERY user', () => {
		it('allows the user to change their password - RECOVERY', () => {
			cy.createTestUser({ isGuestUser: false })?.then(({ emailAddress }) => {
				cy.resetOktaUserPassword(emailAddress).then(() => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.RECOVERY);
						cy.visit('/reset-password');

						const timeRequestWasMade = new Date();
						cy.get('input[name=email]').type(emailAddress);
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade,
						).then(({ body, codes }) => {
							// email
							expect(body).to.have.string('Your one-time passcode');
							expect(codes?.length).to.eq(1);
							const code = codes?.[0].value;
							expect(code).to.match(/^\d{6}$/);

							// passcode page
							cy.url().should('include', '/reset-password/email-sent');
							cy.contains('Enter your one-time code');

							cy.contains('Submit one-time code');
							cy.get('input[name=code]').clear().type(code!);

							// password page
							cy.url().should('include', '/reset-password/password');

							cy.get('input[name="password"]').type(randomPassword());
							cy.get('button[type="submit"]').click();

							// password complete page
							cy.url().should('include', '/reset-password/complete');

							cy.contains('Password updated');
						});
					});
				});
			});
		});
	});

	context('PASSWORD_EXPIRED user', () => {
		it('allows the user to change their password - PASSWORD_EXPIRED', () => {
			cy.createTestUser({ isGuestUser: false })?.then(({ emailAddress }) => {
				cy.expireOktaUserPassword(emailAddress).then(() => {
					cy.getTestOktaUser(emailAddress).then((oktaUser) => {
						expect(oktaUser.status).to.eq(Status.PASSWORD_EXPIRED);
						cy.visit('/reset-password');

						const timeRequestWasMade = new Date();
						cy.get('input[name=email]').type(emailAddress);
						cy.get('[data-cy="main-form-submit-button"]').click();

						cy.checkForEmailAndGetDetails(
							emailAddress,
							timeRequestWasMade,
						).then(({ body, codes }) => {
							// email
							expect(body).to.have.string('Your one-time passcode');
							expect(codes?.length).to.eq(1);
							const code = codes?.[0].value;
							expect(code).to.match(/^\d{6}$/);

							// passcode page
							cy.url().should('include', '/reset-password/email-sent');
							cy.contains('Enter your one-time code');

							cy.contains('Submit one-time code');
							cy.get('input[name=code]').clear().type(code!);

							// password page
							cy.url().should('include', '/reset-password/password');

							cy.get('input[name="password"]').type(randomPassword());
							cy.get('button[type="submit"]').click();

							// password complete page
							cy.url().should('include', '/reset-password/complete');

							cy.contains('Password updated');
						});
					});
				});
			});
		});
	});

	context('NON_EXISTENT user', () => {
		it('shows the passcode page with no account info, and using passcode returns error', () => {
			const emailAddress = randomMailosaurEmail();
			cy.visit(`/reset-password`);

			cy.contains('Reset password');
			cy.get('input[name=email]').type(emailAddress);
			cy.get('[data-cy="main-form-submit-button"]').click();

			// passcode page
			cy.url().should('include', '/reset-password/email-sent');
			cy.contains('Enter your one-time code');
			cy.contains('Don’t have an account?');

			cy.contains('Submit one-time code');
			cy.get('input[name=code]').clear().type('123456');

			cy.url().should('include', '/reset-password/code');
			cy.contains('Enter your one-time code');
			cy.contains('Don’t have an account?');

			cy.contains('Incorrect code');
		});

		it('should redirect with error when multiple passcode attempts fail', () => {
			const emailAddress = randomMailosaurEmail();
			cy.visit(`/reset-password`);

			cy.contains('Reset password');
			cy.get('input[name=email]').type(emailAddress);
			cy.get('[data-cy="main-form-submit-button"]').click();

			// passcode page
			cy.url().should('include', '/reset-password/email-sent');
			cy.contains('Enter your one-time code');
			cy.contains('Don’t have an account?');

			// attempt 1
			cy.contains('Submit one-time code');
			cy.get('input[name=code]').type('123456');
			cy.url().should('include', '/reset-password/code');
			cy.contains('Incorrect code');

			// attempt 2
			cy.get('input[name=code]').type('123456');
			cy.contains('Submit one-time code').click();
			cy.url().should('include', '/reset-password/code');
			cy.contains('Incorrect code');

			// attempt 3
			cy.get('input[name=code]').type('123456');
			cy.contains('Submit one-time code').click();
			cy.url().should('include', '/reset-password/code');
			cy.contains('Incorrect code');

			// attempt 4
			cy.get('input[name=code]').type('123456');
			cy.contains('Submit one-time code').click();
			cy.url().should('include', '/reset-password/code');
			cy.contains('Incorrect code');

			// attempt 5
			cy.get('input[name=code]').type('123456');
			cy.contains('Submit one-time code').click();
			cy.url().should('include', '/reset-password');
			cy.contains('Your code has expired');
		});
	});
});
