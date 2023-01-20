describe('Sign out flow', () => {
  context('Signs a user out', () => {
    it('Removes Okta cookies and dotcom cookies when signing out', () => {
      cy.createTestUser({
        isUserEmailValidated: true,
      })?.then(({ emailAddress, finalPassword }) => {
        // Disable redirect to /signin/success by default
        cy.setCookie(
          'GU_ran_experiments',
          new URLSearchParams({
            OptInPromptPostSignIn: Date.now().toString(),
          }).toString(),
        );

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
        // check idapi cookies are set
        cy.getCookie('SC_GU_U').should('exist');
        cy.getCookie('SC_GU_LA').should('exist');
        cy.getCookie('GU_U').should('exist');

        // attempt to sign out and redirect to reset password as it's on same domain
        const postSignOutReturnUrl = `https://${Cypress.env(
          'BASE_URI',
        )}/reset-password`;
        cy.visit(
          `/signout?returnUrl=${encodeURIComponent(postSignOutReturnUrl)}`,
        );
        cy.getCookie('sid').should('not.exist');
        // check cookies are removed
        cy.getCookie('SC_GU_U').should('not.exist');
        cy.getCookie('SC_GU_LA').should('not.exist');
        cy.getCookie('GU_U').should('not.exist');
      });
    });
  });
});
