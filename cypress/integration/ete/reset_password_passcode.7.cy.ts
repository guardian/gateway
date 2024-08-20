import { randomPassword } from '../../support/commands/testUser';

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
					`/reset-password?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}&usePasscodesResetPassword=true`,
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
						cy.get('input[name=code]').type(code!);

						cy.get('form')
							.should('have.attr', 'action')
							.and('match', new RegExp(encodedReturnUrl))
							.and('match', new RegExp(refViewId))
							.and('match', new RegExp(encodedRef))
							.and('match', new RegExp(clientId));

						cy.contains('Submit one-time code').click();

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
					`/reset-password?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}&appClientId=${appClientId}&fromURI=${fromURI}&usePasscodesResetPassword=true`,
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
						cy.get('input[name=code]').type(code!);

						cy.get('form')
							.should('have.attr', 'action')
							.and('match', new RegExp(encodedReturnUrl))
							.and('match', new RegExp(refViewId))
							.and('match', new RegExp(encodedRef))
							.and('match', new RegExp(clientId))
							.and('match', new RegExp(appClientId))
							.and('match', new RegExp(encodeURIComponent(fromURI)));

						cy.contains('Submit one-time code').click();

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
				cy.visit(`/reset-password?usePasscodesResetPassword=true`);

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
						cy.get('input[name=code]').type(`${+code! + 1}`);

						cy.contains('Submit one-time code').click();

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
				cy.visit(`/reset-password?usePasscodesResetPassword=true`);

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

						cy.get('input[name=code]').clear().type(code!);
						cy.contains('Submit one-time code').click();

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
				cy.visit(`/reset-password?usePasscodesResetPassword=true`);

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

							cy.get('input[name=code]').clear().type(code!);
							cy.contains('Submit one-time code').click();

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
				cy.visit(`/reset-password?usePasscodesResetPassword=true`);

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
	});
});
