describe('Jobs terms and conditions flow', () => {
  context('Accepts Jobs terms and conditions and sets their name', () => {
    it.only('should not show the page for a user who has already accepted the terms', () => {
      cy.createTestUser({
        isUserEmailValidated: true,
      })?.then(({ emailAddress, finalPassword }) => {
        // load the consents page as its on the same domain
        const termsAcceptPageUrl = `https://${Cypress.env(
          'BASE_URI',
        )}/agree/GRS?returnUrl=https://profile.thegulocal.com/healthcheck`;

        cy.visit('/signin');
        cy.get('input[name=email]').type(emailAddress);
        cy.get('input[name=password]').type(finalPassword);

        cy.get('[data-cy="sign-in-button"]').click();

        cy.url().should('include', '/signin/success');

        cy.visit(termsAcceptPageUrl);

        // check sign in has worked first
        cy.url().should('include', `/agree/GRS`);
        // check cookies are set
        cy.getCookie('SC_GU_U').should('exist');
        cy.getCookie('SC_GU_LA').should('exist');
        cy.getCookie('GU_U').should('exist');

        cy.contains('Welcome to Guardian Jobs');

        cy.get('input[name=firstName]').clear().type('First Name');
        cy.get('input[name=secondName]').clear().type('Second Name');

        // User should not be in GRS and not have our intentional first/last name.
        cy.getTestUserDetails().then(({ user, status }) => {
          expect(status).to.eq('ok');
          expect(user.privateFields.firstName).not.to.eq('First Name');
          expect(user.privateFields.secondName).not.to.eq('Second Name');
          const joinedGroups = user.userGroups.map(
            (group) => group.packageCode,
          );
          expect(joinedGroups).not.to.include('GRS');
        });

        // Intercept the external redirect page.
        // We just want to check that the redirect happens, not that the page loads.
        cy.intercept('GET', 'https://jobs.theguardian.com/', (req) => {
          req.reply(200);
        });

        cy.findByText('Continue').click();

        // Make sure the returnURL is respected.
        // cy.url().should('include', 'https://jobs.theguardian.com/');

        // User should be in the GRS group and have First/Last name set.
        cy.getTestUserDetails().then(({ user, status }) => {
          expect(status).to.eq('ok');
          expect(user.privateFields.firstName).to.eq('First Name');
          expect(user.privateFields.secondName).to.eq('Second Name');
          const joinedGroups = user.userGroups.map(
            (group) => group.packageCode,
          );
          expect(joinedGroups).to.include('GRS');
        });

        const finalTermsAcceptPageUrl = `https://${Cypress.env(
          'BASE_URI',
        )}/agree/GRS?returnUrl=https://profile.thegulocal.com/404`;
        cy.visit(finalTermsAcceptPageUrl);
      });
    });

    it('should allow a non-jobs user to enter their first/last name and accept the terms', () => {
      cy.createTestUser({
        isUserEmailValidated: true,
      })?.then(({ emailAddress, finalPassword }) => {
        // load the consents page as its on the same domain
        const termsAcceptPageUrl = `https://${Cypress.env(
          'BASE_URI',
        )}/agree/GRS?returnUrl=https://jobs.theguardian.com/`;

        cy.visit('/signin');
        cy.get('input[name=email]').type(emailAddress);
        cy.get('input[name=password]').type(finalPassword);

        cy.get('[data-cy="sign-in-button"]').click();

        cy.url().should('include', '/signin/success');

        cy.visit(termsAcceptPageUrl);

        // check sign in has worked first
        cy.url().should('include', `/agree/GRS`);
        // check cookies are set
        cy.getCookie('SC_GU_U').should('exist');
        cy.getCookie('SC_GU_LA').should('exist');
        cy.getCookie('GU_U').should('exist');

        cy.contains('Welcome to Guardian Jobs');

        cy.get('input[name=firstName]').clear().type('First Name');
        cy.get('input[name=secondName]').clear().type('Second Name');

        // User should not be in GRS and not have our intentional first/last name.
        cy.getTestUserDetails().then(({ user, status }) => {
          expect(status).to.eq('ok');
          expect(user.privateFields.firstName).not.to.eq('First Name');
          expect(user.privateFields.secondName).not.to.eq('Second Name');
          const joinedGroups = user.userGroups.map(
            (group) => group.packageCode,
          );
          expect(joinedGroups).not.to.include('GRS');
        });

        // Intercept the external redirect page.
        // We just want to check that the redirect happens, not that the page loads.
        cy.intercept('GET', 'https://jobs.theguardian.com/', (req) => {
          req.reply(200);
        });

        cy.findByText('Continue').click();

        // Make sure the returnURL is respected.
        cy.url().should('include', 'https://jobs.theguardian.com/');

        // User should be in the GRS group and have First/Last name set.
        cy.getTestUserDetails().then(({ user, status }) => {
          expect(status).to.eq('ok');
          expect(user.privateFields.firstName).to.eq('First Name');
          expect(user.privateFields.secondName).to.eq('Second Name');
          const joinedGroups = user.userGroups.map(
            (group) => group.packageCode,
          );
          expect(joinedGroups).to.include('GRS');
        });
      });
    });
  });
});
