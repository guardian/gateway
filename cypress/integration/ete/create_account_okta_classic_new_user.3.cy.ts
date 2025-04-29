import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';
import { Status } from '../../../src/server/models/okta/User';

describe('Create Account - Okta Classic Flow (useOktaClassic) - new user', () => {
	it('create account - successfully registers using an email with no existing account', () => {
		const encodedReturnUrl =
			'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
		const unregisteredEmail = randomMailosaurEmail();
		const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
		const refViewId = 'testRefViewId';
		const clientId = 'jobs';

		// these params should *not* persist between initial registration and welcome page
		// despite the fact that they PersistableQueryParams, as these are set by the Okta SDK sign in method
		// and subsequent interception, and not by gateway
		const appClientId = 'appClientId1';
		const fromURI = 'fromURI1';

		cy.visit(
			`/register/email?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}&appClientId=${appClientId}&fromURI=${fromURI}&useOktaClassic=true`,
		);

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Check your inbox');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		cy.checkForEmailAndGetDetails(
			unregisteredEmail,
			timeRequestWasMade,
			/welcome\/([^"]*)/,
		).then(({ body, token }) => {
			expect(body).to.have.string('Complete registration');
			cy.visit(`/welcome/${token}`);
			cy.contains('Complete creating account');

			cy.get('form')
				.should('have.attr', 'action')
				.and('match', new RegExp(encodedReturnUrl))
				.and('match', new RegExp(refViewId))
				.and('match', new RegExp(encodedRef))
				.and('match', new RegExp(clientId))
				.and('not.match', new RegExp(appClientId))
				.and('not.match', new RegExp(fromURI));

			//we are reloading here to make sure the params are persisted even on page refresh
			cy.reload();

			cy.get('input[name="firstName"]').type('First Name');
			cy.get('input[name="secondName"]').type('Last Name');
			cy.get('input[name="password"]').type(randomPassword());
			cy.get('button[type="submit"]').click();
			cy.url().should('contain', encodedReturnUrl);
			cy.url().should('contain', refViewId);
			cy.url().should('contain', encodedRef);
			cy.url().should('contain', clientId);
			cy.url().should('not.contain', appClientId);
			cy.url().should('not.contain', fromURI);

			// test the registration platform is set correctly
			cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
				expect(oktaUser.status).to.eq(Status.ACTIVE);
				expect(oktaUser.profile.registrationPlatform).to.eq('profile');
			});
		});
	});

	it('create account - successfully registers using an email with no existing account, and has a prefixed activation token when using a native app', () => {
		cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
			req.reply(200);
		});
		const encodedReturnUrl =
			'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
		const unregisteredEmail = randomMailosaurEmail();
		const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
		const refViewId = 'testRefViewId';
		const clientId = 'jobs';

		// these params should *not* persist between initial registration and welcome page
		// despite the fact that they PersistableQueryParams, as these are set by the Okta SDK sign in method
		// and subsequent interception, and not by gateway
		const appClientId = Cypress.env('OKTA_ANDROID_CLIENT_ID');
		const fromURI = 'fromURI1';

		cy.visit(
			`/register/email?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}&appClientId=${appClientId}&fromURI=${fromURI}&useOktaClassic=true`,
		);

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Check your inbox');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		cy.checkForEmailAndGetDetails(
			unregisteredEmail,
			timeRequestWasMade,
			/welcome\/([^"]*)/,
		).then(({ body, token }) => {
			expect(body).to.have.string('Complete registration');
			expect(token).to.have.string('al_');
			cy.visit(`/welcome/${token}`);
			cy.contains('Complete creating account');

			cy.get('form')
				.should('have.attr', 'action')
				.and('match', new RegExp(encodedReturnUrl))
				.and('match', new RegExp(refViewId))
				.and('match', new RegExp(encodedRef))
				.and('match', new RegExp(clientId))
				.and('not.match', new RegExp(appClientId))
				.and('not.match', new RegExp(fromURI));

			//we are reloading here to make sure the params are persisted even on page refresh
			cy.reload();

			cy.get('form')
				.should('have.attr', 'action')
				.and('match', new RegExp(encodedReturnUrl))
				.and('match', new RegExp(refViewId))
				.and('match', new RegExp(encodedRef))
				.and('match', new RegExp(clientId))
				.and('not.match', new RegExp(appClientId))
				.and('not.match', new RegExp(fromURI));

			cy.get('input[name="firstName"]').type('First Name');
			cy.get('input[name="secondName"]').type('Last Name');
			cy.get('input[name="password"]').type(randomPassword());
			cy.get('button[type="submit"]').click();
			cy.url().should('contain', '/welcome/al_/complete');
			cy.contains(unregisteredEmail);
			cy.contains('Guardian app');

			// test the registration platform is set correctly
			cy.getTestOktaUser(unregisteredEmail).then((oktaUser) => {
				expect(oktaUser.status).to.eq(Status.ACTIVE);
				expect(oktaUser.profile.registrationPlatform).to.eq('android_live_app');
			});
		});
	});

	it('welcome expired - send an email for user with no existing account', () => {
		const encodedReturnUrl =
			'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
		const unregisteredEmail = randomMailosaurEmail();

		cy.visit(
			`/welcome/resend?returnUrl=${encodedReturnUrl}&useOktaClassic=true`,
		);

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Check your inbox');
		cy.contains(unregisteredEmail);
		cy.contains('send again');
		cy.contains('try another address');

		cy.checkForEmailAndGetDetails(
			unregisteredEmail,
			timeRequestWasMade,
			/welcome\/([^"]*)/,
		).then(({ body, token }) => {
			expect(body).to.have.string('Complete registration');
			cy.visit(`/welcome/${token}`);
			cy.contains('Complete creating account');

			cy.get('form')
				.should('have.attr', 'action')
				.and('match', new RegExp(encodedReturnUrl));

			//we are reloading here to make sure the params are persisted even on page refresh
			cy.reload();

			cy.get('input[name="password"]').type(randomPassword());
			cy.get('button[type="submit"]').click();
			cy.url().should('contain', encodedReturnUrl);
		});
	});
});
