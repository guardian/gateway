describe('Jobs terms and conditions flow in Okta', () => {
  context('Accepts Jobs terms and conditions and sets their name', () => {
    it('should redirect users with an invalid session cookie to reauthenticate', () => {
      // load the consents page as its on the same domain
      const termsAcceptPageUrl = `https://${Cypress.env(
        'BASE_URI',
      )}/agree/GRS?returnUrl=https://profile.thegulocal.com/signin?returnUrl=https%3A%2F%2Fm.code.dev-theguardian.com%2F`;
      cy.setCookie('sid', 'invalid-cookie');
      cy.visit(termsAcceptPageUrl);
      cy.url().should(
        'include',
        'https://profile.thegulocal.com/reauthenticate',
      );
    });

    it('should redirect users with no session cookie to the signin page', () => {
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

    it('should show the jobs terms page for users who do not have first/last name set, but are jobs users', () => {
      cy.createTestUser({
        isUserEmailValidated: true,
      })?.then(({ emailAddress, finalPassword }) => {
        cy.visit('/signin');
        cy.get('input[name=email]').type(emailAddress);
        cy.get('input[name=password]').type(finalPassword);

        cy.get('[data-cy="main-form-submit-button"]').click();

        cy.url().should('include', '/signin/success');

        const termsAcceptPageUrl = `https://${Cypress.env(
          'BASE_URI',
        )}/agree/GRS?returnUrl=https://profile.thegulocal.com/healthcheck`;

        // Create a test user without a first/last name who has `isJobsUser` set to true.
        cy.updateOktaTestUserProfile(emailAddress, {
          firstName: '',
          lastName: '',
          isJobsUser: true,
        }).then(() => {
          cy.visit(termsAcceptPageUrl);
          cy.contains('Please complete your details for');
          cy.contains(emailAddress);
          cy.contains('We will use these details on your job applications');

          cy.get('input[name=firstName]').should('be.empty');
          cy.get('input[name=secondName]').should('be.empty');

          cy.get('input[name=firstName]').type('First Name');
          cy.get('input[name=secondName]').type('Second Name');

          cy.findByText('Save and continue').click();

          // User should have `isJobsUser` set to true and First/Last name set to our custom values.
          cy.getTestOktaUser(emailAddress).then(({ profile, status }) => {
            const { firstName, lastName, isJobsUser } = profile;
            expect(status).to.eq('ACTIVE');
            expect(firstName).to.eq('First Name');
            expect(lastName).to.eq('Second Name');
            expect(isJobsUser).to.eq(true);
          });
        });
      });
    });

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

        cy.get('[data-cy="main-form-submit-button"]').click();

        cy.url().should('include', '/signin/success');

        cy.updateOktaTestUserProfile(emailAddress, {
          firstName: 'Test',
          lastName: 'User',
          isJobsUser: true,
        }).then(() => {
          cy.visit(termsAcceptPageUrl);

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

        cy.get('[data-cy="main-form-submit-button"]').click();

        cy.url().should('include', '/signin/success');

        cy.visit(termsAcceptPageUrl);

        // check sign in has worked first
        cy.url().should('include', `/agree/GRS`);
        // check session cookie is set
        cy.getCookie('sid').should('exist');
        // check idapi cookies are set
        cy.getCookie('SC_GU_U').should('exist');
        cy.getCookie('SC_GU_LA').should('exist');
        cy.getCookie('GU_U').should('exist');

        cy.contains('Welcome to Guardian Jobs');

        // User should not be a jobs user yet and have their original first/last name.
        cy.getTestOktaUser(emailAddress).then(({ profile, status }) => {
          const { firstName, lastName, isJobsUser } = profile;
          expect(status).to.eq('ACTIVE');
          cy.get('input[name=firstName]').should('contain.value', firstName);
          cy.get('input[name=secondName]').should('contain.value', lastName);
          expect(isJobsUser).to.eq(false);
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

        // User should have `isJobsUser` set to true and their First/Last name set.
        cy.getTestOktaUser(emailAddress).then(({ profile, status }) => {
          const { firstName, lastName, isJobsUser } = profile;
          expect(status).to.eq('ACTIVE');
          expect(firstName).to.eq('First Name');
          expect(lastName).to.eq('Second Name');
          expect(isJobsUser).to.eq(true);
        });
      });
    });
  });
});
