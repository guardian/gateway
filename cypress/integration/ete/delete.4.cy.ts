import { randomPassword } from '../../support/commands/testUser';

describe('Delete my account flow in Okta', () => {
	const signInAndVisitDeletePage = (email: string, password: string) => {
		// First, sign in
		cy.visit(
			`/signin?returnUrl=${encodeURIComponent(
				`https://${Cypress.env('BASE_URI')}/welcome/review`,
			)}&usePasswordSignIn=true`,
		);
		cy.get('input[name=email]').type(email);
		cy.get('input[name=password]').type(password);
		cy.get('[data-cy="main-form-submit-button"]').click();
		cy.url().should('include', '/welcome/review');

		// Then, try to visit the delete page
		cy.visit(`/delete`);
	};

	it('successfully deletes a user account', () => {
		cy.createTestUser({ isUserEmailValidated: true }).then(
			({ emailAddress, finalPassword }) => {
				signInAndVisitDeletePage(emailAddress, finalPassword);
				// Then, try to delete the account
				cy.contains('I have created an account by accident').click();
				cy.get('input[name=password]').type(finalPassword);
				cy.get('[data-cy="main-form-submit-button"]').click();

				cy.url().should('include', '/delete/complete');
				cy.contains('Account deleted');
				cy.contains('Return to the Guardian');
			},
		);
	});

	it('shows an error when the password is incorrect', () => {
		cy.createTestUser({ isUserEmailValidated: true }).then(
			({ emailAddress, finalPassword }) => {
				signInAndVisitDeletePage(emailAddress, finalPassword);
				// Then, try to delete the account, but with the wrong password
				cy.contains('I have created an account by accident').click();
				cy.get('input[name=password]').type('wrong-password');
				cy.get('[data-cy="main-form-submit-button"]').click();

				cy.url().should('include', '/delete');
				cy.contains('Password is incorrect');

				// Then, try to delete the account proper
				cy.contains('I have created an account by accident').click();
				cy.get('input[name=password]').type(finalPassword);
				cy.get('[data-cy="main-form-submit-button"]').click();

				cy.url().should('include', '/delete/complete');
				cy.contains('Account deleted');
				cy.contains('Return to the Guardian');
			},
		);
	});

	it('should block user from deleting account if they have a digital pack', () => {
		cy.createTestUser({ isUserEmailValidated: true }).then(
			({ emailAddress, finalPassword }) => {
				// set the mock state cookie
				cy.setCookie('cypress-mock-state', 'digitalPack');

				signInAndVisitDeletePage(emailAddress, finalPassword);

				// Then, try to delete the account, but blocked
				cy.contains('You have an active Digital Pack subscription');
			},
		);
	});

	it('should block user from deleting account if they have a paper subscription', () => {
		cy.createTestUser({ isUserEmailValidated: true }).then(
			({ emailAddress, finalPassword }) => {
				// set the mock state cookie
				cy.setCookie('cypress-mock-state', 'paperSubscriber');

				signInAndVisitDeletePage(emailAddress, finalPassword);

				// Then, try to delete the account, but blocked
				cy.contains(
					'You have an active print subscription to one of our newspapers',
				);
			},
		);
	});

	it('should block user from deleting account if they have a guardian weekly subscription', () => {
		cy.createTestUser({ isUserEmailValidated: true }).then(
			({ emailAddress, finalPassword }) => {
				// set the mock state cookie
				cy.setCookie('cypress-mock-state', 'guardianWeeklySubscriber');

				signInAndVisitDeletePage(emailAddress, finalPassword);

				// Then, try to delete the account, but blocked
				cy.contains(
					'You have an active print subscription to the Guardian Weekly',
				);
			},
		);
	});

	it('should block user from deleting account if they have a feast subscription', () => {
		cy.createTestUser({ isUserEmailValidated: true }).then(
			({ emailAddress, finalPassword }) => {
				// set the mock state cookie
				cy.setCookie('cypress-mock-state', 'feast');

				signInAndVisitDeletePage(emailAddress, finalPassword);

				// Then, try to delete the account, but blocked
				cy.contains(
					'You have an active subscription to the Guardian Feast app',
				);
			},
		);
	});

	it('should block user from deleting account if they are a recurring contributor', () => {
		cy.createTestUser({ isUserEmailValidated: true }).then(
			({ emailAddress, finalPassword }) => {
				// set the mock state cookie
				cy.setCookie('cypress-mock-state', 'recurringContributor');

				signInAndVisitDeletePage(emailAddress, finalPassword);

				// Then, try to delete the account, but blocked
				cy.contains('You have a recurring contribution');
			},
		);
	});

	it('should block user from deleting account if they are a member', () => {
		cy.createTestUser({ isUserEmailValidated: true }).then(
			({ emailAddress, finalPassword }) => {
				// set the mock state cookie
				cy.setCookie('cypress-mock-state', 'member');

				signInAndVisitDeletePage(emailAddress, finalPassword);

				// Then, try to delete the account, but blocked
				cy.contains('You have an active membership');
			},
		);
	});

	it('should block user from deleting account if they are a paid member', () => {
		cy.createTestUser({ isUserEmailValidated: true }).then(
			({ emailAddress, finalPassword }) => {
				// set the mock state cookie
				cy.setCookie('cypress-mock-state', 'paidMember');

				signInAndVisitDeletePage(emailAddress, finalPassword);

				// Then, try to delete the account, but blocked
				cy.contains('You have an active membership');
			},
		);
	});

	it('should show the email validation page if the user does not have a validated email address', () => {
		cy.createTestUser({ isUserEmailValidated: true }).then(
			({ emailAddress, finalPassword }) => {
				// set the mock state cookie
				cy.setCookie('cypress-mock-state', 'unvalidatedEmail');

				signInAndVisitDeletePage(emailAddress, finalPassword);

				// Then, try to delete the account, but blocked
				cy.contains(
					'Before you can delete your account you need to validate your email address.',
				);

				const timeRequestWasMade = new Date();

				cy.contains('Send validation email').click();

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

						cy.get('input[name="password"]').type(randomPassword());
						cy.get('button[type="submit"]').click();

						cy.url().should('contain', '/reset-password/complete');
						cy.clearCookie('cypress-mock-state');
						cy.contains('Continue to the Guardian').click();
						cy.url().should('contain', '/delete');
					},
				);
			},
		);
	});

	it('should show the email validation page if the user does not have a password set', () => {
		cy.createTestUser({ isUserEmailValidated: true }).then(
			({ emailAddress, finalPassword }) => {
				// set the mock state cookie
				cy.setCookie('cypress-mock-state', 'noPassword');

				signInAndVisitDeletePage(emailAddress, finalPassword);

				// Then, try to delete the account, but blocked
				cy.contains(
					'Before you can delete your account you need to set a password for your account.',
				);
				const timeRequestWasMade = new Date();

				cy.contains('Set password').click();

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

						cy.get('input[name="password"]').type(randomPassword());
						cy.get('button[type="submit"]').click();

						cy.url().should('contain', '/reset-password/complete');
						cy.clearCookie('cypress-mock-state');
						cy.contains('Continue to the Guardian').click();
						cy.url().should('contain', '/delete');
					},
				);
			},
		);
	});
});
