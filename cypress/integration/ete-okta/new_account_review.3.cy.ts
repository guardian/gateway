import { Consents } from '../../../src/shared/model/Consent';
import {
	randomMailosaurEmail,
	randomPassword,
} from '../../support/commands/testUser';

describe('New account review page', () => {
	it('should show the profiling and personalised advertising checkboxes if CMP accepted', () => {
		const encodedReturnUrl =
			'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
		const unregisteredEmail = randomMailosaurEmail();

		// Set the country cookie so we can check that it's set correctly on the user
		cy.setCookie('GU_geo_country', 'US');

		// Consent to CMP so we are shown the personalised advertising checkbox
		cy.enableCMP();
		cy.visit(`/register/email?returnUrl=${encodedReturnUrl}`);
		cy.acceptCMP();

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Check your email inbox');
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
			cy.get('input[name="password"]').type(randomPassword());
			cy.get('button[type="submit"]').click();

			cy.url().should('contain', '/welcome/review');

			// Always shown
			cy.get('fieldset').contains(
				'Allow the Guardian to analyse my signed-in data to improve marketing content',
			);
			cy.contains('What we mean by signed-in data');

			// Only shown when CMP consented
			cy.get('fieldset').contains(
				'Allow personalised advertising with my signed-in data',
			);
			cy.contains('Advertising is a crucial source of our funding');

			// Flip the switches so personalised advertising is on
			// and profiling is off
			cy.get(`label#${Consents.ADVERTISING}_description`).click();
			cy.get(`label#${Consents.PROFILING}_description`).click();
			cy.get('button[type="submit"]').click();

			cy.url().should('contain', decodeURIComponent(encodedReturnUrl));

			// Return to Gateway so we can access the user cookie
			cy.visit('/signin');

			cy.getTestUserDetails().then((response) => {
				const consentIds = response.user.consents.filter(
					(consent) =>
						consent.id === 'profiling_optout' ||
						consent.id === 'personalised_advertising',
				);
				expect(consentIds).to.have.length(2);
				response.user.consents.map((consent) => {
					if (consent.id === 'profiling_optout') {
						// Profiling is modelled as an optout so we now expect it to be true
						expect(consent.consented).to.be.true;
					}
					if (consent.id === 'personalised_advertising') {
						expect(consent.consented).to.be.true;
					}
				});
				cy.getTestOktaUser(unregisteredEmail).then((user) => {
					expect(user.profile.registrationLocation).to.equal('United States');
				});
			});
		});
	});
	it('should show only the profiling checkbox if CMP is not accepted', () => {
		const encodedReturnUrl =
			'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
		const unregisteredEmail = randomMailosaurEmail();

		cy.visit(`/register/email?returnUrl=${encodedReturnUrl}`);

		const timeRequestWasMade = new Date();
		cy.get('input[name=email]').type(unregisteredEmail);
		cy.get('[data-cy="main-form-submit-button"]').click();

		cy.contains('Check your email inbox');
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
			cy.get('input[name="password"]').type(randomPassword());
			cy.get('button[type="submit"]').click();

			cy.url().should('contain', '/welcome/review');

			cy.get('fieldset').contains(
				'Allow the Guardian to analyse my signed-in data to improve marketing content',
			);
			cy.contains('What we mean by signed-in data');

			cy.get('fieldset').should(
				'not.contain',
				'Allow personalised advertising with my signed-in data',
			);
			cy.should(
				'not.contain',
				'Advertising is a crucial source of our funding',
			);

			cy.get('button[type="submit"]').click();

			cy.url().should('contain', decodeURIComponent(encodedReturnUrl));

			// Return to Gateway so we can access the user cookie
			cy.visit('/signin');

			// Check that the user does not have their registration location set
			cy.getTestOktaUser(unregisteredEmail).then((user) => {
				expect(user.profile.registrationLocation).to.be.undefined;
			});
		});
	});
});
