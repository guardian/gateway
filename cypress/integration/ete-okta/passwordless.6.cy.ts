import { randomMailosaurEmail } from '../../support/commands/testUser';

describe('Passwordless PoC', () => {
	context('Registration', () => {
		it('does passwordless registration', () => {
			const unregisteredEmail = randomMailosaurEmail();
			const timeRequestWasMade = new Date();
			cy.visit('/register/email');

			cy.get('input[name="email"]').type(unregisteredEmail);
			cy.get('[data-cy="main-form-submit-button"]').click();

			cy.contains('Check your email inbox');
			cy.contains(unregisteredEmail);
			cy.get('input[name=passcode]').should('exist');

			cy.checkForEmailAndGetDetails(
				unregisteredEmail,
				timeRequestWasMade,
				/<strong>(\d{6})<\/strong>/,
			).then(({ token }) => {
				expect(token).to.match(/^\d{6}$/);

				cy.get('input[name=passcode]').type(token as string);
				cy.contains('Submit passcode').click();

				cy.url().should('contain', '/register/passwordless/complete');
				cy.contains('Return to the Guardian').click();

				cy.visit('/signin');

				cy.contains(unregisteredEmail);
			});
		});
	});
});
