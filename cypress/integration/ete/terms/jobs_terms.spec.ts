describe('Jobs terms and conditions flow', () => {
  context('Accepts Jobs terms and conditions and sets their name', () => {
    it('should redirect users with an invalid SC_GU_U cookie to the signin page', () => {
      // load the consents page as its on the same domain
      const termsAcceptPageUrl = `https://${Cypress.env(
        'BASE_URI',
      )}/agree/GRS?returnUrl=https://profile.thegulocal.com/signin?returnUrl=https%3A%2F%2Fm.code.dev-theguardian.com%2F`;

      cy.setCookie('SC_GU_U', 'invalid-cookie');

      cy.visit(termsAcceptPageUrl);
      cy.url().should('include', 'https://profile.thegulocal.com/signin');
    });

    it('should redirect users with no SC_GU_U cookie to the signin page', () => {
      // load the consents page as its on the same domain
      const termsAcceptPageUrl = `https://${Cypress.env(
        'BASE_URI',
      )}/agree/GRS?returnUrl=https://profile.thegulocal.com/healthcheck`;
      cy.visit(termsAcceptPageUrl);
      cy.url().should(
        'include',
        'https://profile.thegulocal.com/signin?returnUrl=https%3A%2F%2Fprofile.thegulocal.com%2Fhealthcheck',
      );
    });

    // it('should show the jobs terms page for users who do not have first/last name set, but are part of GRS', () => {});

    it('should redirect users who have already accepted the terms away', () => {
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

        // User should not be in GRS and have the original first/last name.
        cy.getTestUserDetails().then(({ user, status }) => {
          expect(status).to.eq('ok');
          cy.get('input[name=firstName]').should(
            'contain.value',
            user.privateFields.firstName,
          );
          cy.get('input[name=secondName]').should(
            'contain.value',
            user.privateFields.secondName,
          );

          const joinedGroups = user.userGroups.map(
            (group) => group.packageCode,
          );
          expect(joinedGroups).not.to.include('GRS');
        });

        cy.get('input[name=firstName]').clear().type('First Name');
        cy.get('input[name=secondName]').clear().type('Second Name');

        cy.findByText('Continue').click();

        // User should be in the GRS group and have First/Last name set to our custom values.
        cy.getTestUserDetails().then(({ user, status }) => {
          expect(status).to.eq('ok');
          expect(user.privateFields.firstName).to.eq('First Name');
          expect(user.privateFields.secondName).to.eq('Second Name');
          const joinedGroups = user.userGroups.map(
            (group) => group.packageCode,
          );
          expect(joinedGroups).to.include('GRS');
        });

        cy.url().should(
          'include',
          'https://profile.thegulocal.com/healthcheck',
        );

        const finalTermsAcceptPageUrl = `https://${Cypress.env(
          'BASE_URI',
        )}/agree/GRS?returnUrl=https://profile.thegulocal.com/maintenance`;

        cy.visit(finalTermsAcceptPageUrl, { failOnStatusCode: false });

        // Make sure the returnURL is respected.
        cy.url().should(
          'include',
          'https://profile.thegulocal.com/maintenance',
        );
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

        // User should not be in GRS and have the original first/last name.
        cy.getTestUserDetails().then(({ user, status }) => {
          expect(status).to.eq('ok');
          cy.get('input[name=firstName]').should(
            'contain.value',
            user.privateFields.firstName,
          );
          cy.get('input[name=secondName]').should(
            'contain.value',
            user.privateFields.secondName,
          );

          const joinedGroups = user.userGroups.map(
            (group) => group.packageCode,
          );
          expect(joinedGroups).not.to.include('GRS');
        });

        cy.get('input[name=firstName]').clear().type('First Name');
        cy.get('input[name=secondName]').clear().type('Second Name');

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
