describe('Sign out flow', () => {
	context('Signs a user out', () => {
		it('Removes Okta cookies and dotcom cookies when signing out', () => {
			cy
				.createTestUser({
					isUserEmailValidated: true,
				})
				?.then(({ emailAddress, finalPassword }) => {
					// load the consents page as its on the same domain
					const postSignInReturnUrl = `https://${Cypress.env(
						'BASE_URI',
					)}/consents/data`;
					const visitUrl = `/signin?returnUrl=${encodeURIComponent(
						postSignInReturnUrl,
					)}`;
					cy.visit(visitUrl);
					cy.get('input[name=email]').type(emailAddress);
					cy.get('input[name=password]').type(finalPassword);
					cy.get('[data-cy="main-form-submit-button"]').click();
					// check sign in has worked first
					cy.url().should('include', `/consents/data`);
					// check session cookie is set
					cy.getCookie('sid').should('exist');
					cy.getCookie('idx').should('exist');
					// check idapi cookies are set
					cy.getCookie('SC_GU_U').should('exist');
					cy.getCookie('SC_GU_LA').should('exist');
					cy.getCookie('GU_U').should('exist');

					// attempt to sign out and redirect to sign in to make sure the cookies are removed
					// and the signed in as page isn't visible
					const postSignOutReturnUrl = `https://${Cypress.env(
						'BASE_URI',
					)}/signin`;
					cy.visit(
						`/signout?returnUrl=${encodeURIComponent(postSignOutReturnUrl)}`,
					);
					// cypress 12 seems to have issues with hostOnly cookies not being removed or persisting after clear
					// https://github.com/cypress-io/cypress/issues/25174
					// so for now I've changed this check to make sure the "Signed in as" page isn't visible
					// cy.getCookie('sid').should('not.exist');
					cy.contains('You are signed in with').should('not.exist');
					// check cookies are removed
					cy.getCookie('SC_GU_U').should('not.exist');
					cy.getCookie('SC_GU_LA').should('not.exist');
					cy.getCookie('GU_U').should('not.exist');
				});
		});
	});
});
