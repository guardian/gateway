import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';

import { Status } from '../../../src/server/models/okta/User';

describe('Create account flow - passcode - new user/no existing account', () => {
	it('successfully registers using an email with no existing account using a passcode - passwordless user', () => {
		const encodedReturnUrl =
			'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
		const unregisteredEmail = randomMailosaurEmail();
		const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
		const refViewId = 'testRefViewId';
		const clientId = 'jobs';

		cy.visit(
			`/register/email?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}`,
		);

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Enter your code');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
			({ body, codes }) => {
				// email
				expect(body).to.have.string('Your verification code');
				expect(codes?.length).to.eq(1);
				const code = codes?.[0].value;
				expect(code).to.match(/^\d{6}$/);

				// passcode page
				cy.url().should('include', '/register/email-sent');
				cy.get('form')
					.should('have.attr', 'action')
					.and('match', new RegExp(encodedReturnUrl))
					.and('match', new RegExp(refViewId))
					.and('match', new RegExp(encodedRef))
					.and('match', new RegExp(clientId));

				cy.contains('Submit verification code');

				cy.get('input[name=code]').type(code!);

				// test the registration platform is set correctly
				cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
					expect(oktaUser.status).to.eq(Status.ACTIVE);
					expect(oktaUser.profile.registrationPlatform).to.eq('profile');
				});

				cy.url().should('contain', '/welcome/review');
			},
		);
	});

	it('successfully registers using an email with no existing account using a passcode and redirects to fromURI - passwordless user', () => {
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

		const encodedReturnUrl =
			'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
		const unregisteredEmail = randomMailosaurEmail();
		const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
		const refViewId = 'testRefViewId';

		cy.visit(
			`/register/email?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&appClientId=${appClientId}&fromURI=${fromURI}`,
		);

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Enter your code');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
			({ body, codes }) => {
				// email
				expect(body).to.have.string('Your verification code');
				expect(codes?.length).to.eq(1);
				const code = codes?.[0].value;
				expect(code).to.match(/^\d{6}$/);

				// passcode page
				cy.url().should('include', '/register/email-sent');
				cy.get('form')
					.should('have.attr', 'action')
					.and('match', new RegExp(encodedReturnUrl))
					.and('match', new RegExp(refViewId))
					.and('match', new RegExp(encodedRef))
					.and('match', new RegExp(appClientId))
					.and('match', new RegExp(encodeURIComponent(fromURI)));

				cy.contains('Submit verification code');
				cy.get('input[name=code]').type(code!);

				// test the registration platform is set correctly
				cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
					expect(oktaUser.status).to.eq(Status.ACTIVE);
					expect(oktaUser.profile.registrationPlatform).to.eq('profile');
				});

				cy.url().should('contain', decodeURIComponent(fromURI));
			},
		);
	});

	it('successfully registers using an email with no existing account using a passcode and redirects to fromURI - password user', () => {
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

		const encodedReturnUrl =
			'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
		const unregisteredEmail = randomMailosaurEmail();
		const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
		const refViewId = 'testRefViewId';

		cy.visit(
			`/register/email?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&appClientId=${appClientId}&fromURI=${fromURI}&useSetPassword=true`,
		);

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Enter your code');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
			({ body, codes }) => {
				// email
				expect(body).to.have.string('Your verification code');
				expect(codes?.length).to.eq(1);
				const code = codes?.[0].value;
				expect(code).to.match(/^\d{6}$/);

				// passcode page
				cy.url().should('include', '/register/email-sent');
				cy.get('form')
					.should('have.attr', 'action')
					.and('match', new RegExp(encodedReturnUrl))
					.and('match', new RegExp(refViewId))
					.and('match', new RegExp(encodedRef))
					.and('match', new RegExp(appClientId))
					.and('match', new RegExp(encodeURIComponent(fromURI)));

				cy.contains('Submit verification code');
				cy.get('input[name=code]').type(code!);

				cy.get('input[name="password"]').type(randomPassword());
				cy.get('button[type="submit"]').click();

				// test the registration platform is set correctly
				cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
					expect(oktaUser.status).to.eq(Status.ACTIVE);
					expect(oktaUser.profile.registrationPlatform).to.eq('profile');
				});

				cy.url().should('contain', decodeURIComponent(fromURI));
			},
		);
	});

	it('registers registrationLocation for email with no existing account', () => {
		const unregisteredEmail = randomMailosaurEmail();

		cy.visit(`/register/email`);
		cy.setCookie('cypress-mock-state', 'FR');
		cy.get('input[name=email]').type(unregisteredEmail);

		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Enter your code');
		cy.contains(unregisteredEmail);

		cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
			expect(oktaUser.profile.registrationLocation).to.eq('Europe');
		});
	});

	it('registers registrationLocation and registrationLocationState for email with no existing account', () => {
		const unregisteredEmail = randomMailosaurEmail();

		cy.visit(`/register/email`);
		cy.setCookie('cypress-mock-state', 'AU-ACT');
		cy.get('input[name=email]').type(unregisteredEmail);

		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Enter your code');
		cy.contains(unregisteredEmail);

		cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
			expect(oktaUser.profile.registrationLocation).to.eq('Australia');
			expect(oktaUser.profile.registrationLocationState).to.eq(
				'Australian Capital Territory',
			);
		});
	});

	it('successfully blocks the password set page /welcome if a password has already been set - password user', () => {
		const unregisteredEmail = randomMailosaurEmail();
		cy.visit(`/register/email?useSetPassword=true`);

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Enter your code');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
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

				cy.contains('Complete creating account');

				cy.get('input[name="password"]').type(randomPassword());
				cy.get('button[type="submit"]').click();
				cy.url().should('contain', '/welcome/review');
				cy.go('back');
				cy.url().should('contain', '/welcome/');
				cy.contains('Password already set for');
			},
		);
	});

	it('passcode incorrect functionality', () => {
		const unregisteredEmail = randomMailosaurEmail();
		cy.visit(`/register/email`);

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Enter your code');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
			({ body, codes }) => {
				// email
				expect(body).to.have.string('Your verification code');
				expect(codes?.length).to.eq(1);
				const code = codes?.[0].value;
				expect(code).to.match(/^\d{6}$/);

				// passcode page
				cy.url().should('include', '/register/email-sent');
				cy.contains('Submit verification code');
				cy.get('input[name=code]').type(`${+code! + 1}`);

				cy.url().should('include', '/register/code');

				cy.contains('Incorrect code');

				cy.get('input[name=code]').clear().type(code!);
				cy.contains('Submit verification code').click();

				cy.url().should('contain', '/welcome/review');
			},
		);
	});

	it('passcode used functionality', () => {
		const unregisteredEmail = randomMailosaurEmail();
		cy.visit(`/register/email`);

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Enter your code');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
			({ body, codes }) => {
				// email
				expect(body).to.have.string('Your verification code');
				expect(codes?.length).to.eq(1);
				const code = codes?.[0].value;
				expect(code).to.match(/^\d{6}$/);

				// passcode page
				cy.contains('Submit verification code');
				cy.get('input[name=code]').clear().type(code!);

				cy.url().should('contain', '/welcome/review');

				cy.go('back');
				cy.url().should('contain', '/register/email');
				cy.contains('Email verified');
				cy.contains('Complete creating account').click();

				cy.url().should('contain', '/welcome/review');
			},
		);
	});

	it('resend email functionality', () => {
		cy.setCookie('cypress-mock-state', '1'); // passcode send again timer
		const unregisteredEmail = randomMailosaurEmail();
		cy.visit(`/register/email`);

		const timeRequestWasMade1 = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Enter your code');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade1).then(
			({ body, codes }) => {
				// email
				expect(body).to.have.string('Your verification code');
				expect(codes?.length).to.eq(1);
				const code = codes?.[0].value;
				expect(code).to.match(/^\d{6}$/);

				// passcode page
				cy.url().should('include', '/register/email-sent');
				const timeRequestWasMade2 = new Date();
				cy.wait(1000); // wait for the send again button to be enabled
				cy.contains('send again').click();
				cy.checkForEmailAndGetDetails(
					unregisteredEmail,
					timeRequestWasMade2,
				).then(({ body, codes }) => {
					// email
					expect(body).to.have.string('Your verification code');
					expect(codes?.length).to.eq(1);
					const code = codes?.[0].value;
					expect(code).to.match(/^\d{6}$/);

					// passcode page
					cy.url().should('include', '/register/email-sent');
					cy.contains('Email with verification code sent');

					cy.contains('Submit verification code');
					cy.get('input[name=code]').type(code!);

					cy.url().should('contain', '/welcome/review');
				});
			},
		);
	});

	it('change email functionality', () => {
		const unregisteredEmail = randomMailosaurEmail();
		cy.visit(`/register/email`);

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Enter your code');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
			({ body, codes }) => {
				// email
				expect(body).to.have.string('Your verification code');
				expect(codes?.length).to.eq(1);
				const code = codes?.[0].value;
				expect(code).to.match(/^\d{6}$/);

				// passcode page
				cy.url().should('include', '/register/email-sent');
				cy.contains('try another address').click();

				cy.url().should('include', '/register/email');
			},
		);
	});

	it('should redirect with error when multiple passcode attempts fail', () => {
		const unregisteredEmail = randomMailosaurEmail();
		cy.visit(`/register/email`);

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Enter your code');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
			({ body, codes }) => {
				// email
				expect(body).to.have.string('Your verification code');
				expect(codes?.length).to.eq(1);
				const code = codes?.[0].value;
				expect(code).to.match(/^\d{6}$/);

				// passcode page
				cy.url().should('include', '/register/email-sent');

				// attempt 1 - auto submit
				cy.contains('Submit verification code');
				cy.get('input[name=code]').type('000000');
				cy.contains('Incorrect code');
				cy.url().should('include', '/register/code');

				// attempt 2 - manual submit
				cy.get('input[name=code]').type('000000');
				cy.contains('Submit verification code').click();
				cy.contains('Incorrect code');
				cy.url().should('include', '/register/code');

				// attempt 3
				cy.get('input[name=code]').type('000000');
				cy.contains('Submit verification code').click();
				cy.contains('Incorrect code');
				cy.url().should('include', '/register/code');

				// attempt 4
				cy.get('input[name=code]').type('000000');
				cy.contains('Submit verification code').click();
				cy.contains('Incorrect code');
				cy.url().should('include', '/register/code');

				// attempt 5
				cy.get('input[name=code]').type('000000');
				cy.contains('Submit verification code').click();
				cy.url().should('include', '/register/email');
				cy.contains('Your code has expired');
			},
		);
	});
});
