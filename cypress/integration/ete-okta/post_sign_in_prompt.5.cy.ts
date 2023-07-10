describe('Post sign-in prompt', () => {
  beforeEach(() => {
    // Intercept the external redirect page.
    // We just want to check that the redirect happens, not that the page loads.
    cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
      req.reply(200);
    });
    cy.clearCookie('GU_ran_experiments');
  });

  it('allows user to opt in and continue', () => {
    cy
      .createTestUser({
        isUserEmailValidated: true,
      })
      ?.then(({ emailAddress, finalPassword }) => {
        const visitUrl = '/signin';
        cy.visit(visitUrl);
        cy.get('input[name=email]').type(emailAddress);
        cy.get('input[name=password]').type(finalPassword);
        cy.get('[data-cy="main-form-submit-button"]').click();
        cy.url().should('include', `/signin/success`);
        cy.url().should(
          'include',
          `returnUrl=${encodeURIComponent(
            'https://m.code.dev-theguardian.com/',
          )}`,
        );
        const checkbox = cy.findByLabelText('Yes, sign me up');
        checkbox.should('not.be.checked');
        checkbox.click();
        checkbox.should('be.checked');
        cy.findByText('Continue to the Guardian').click();
        cy.url().should('include', 'https://m.code.dev-theguardian.com/');
      });
  });

  it('allows user to opt out and continue', () => {
    cy
      .createTestUser({
        isUserEmailValidated: true,
      })
      ?.then(({ emailAddress, finalPassword }) => {
        const visitUrl = '/signin';
        cy.visit(visitUrl);
        cy.get('input[name=email]').type(emailAddress);
        cy.get('input[name=password]').type(finalPassword);
        cy.get('[data-cy="main-form-submit-button"]').click();
        cy.url().should('include', `/signin/success`);
        cy.url().should(
          'include',
          `returnUrl=${encodeURIComponent(
            'https://m.code.dev-theguardian.com/',
          )}`,
        );
        const checkbox = cy.findByLabelText('Yes, sign me up');
        checkbox.should('not.be.checked');

        cy.findByText('Continue to the Guardian').click();
        cy.url().should('include', 'https://m.code.dev-theguardian.com/');
      });
  });

  it("doesn't show the prompt if the user has already seen it", () => {
    cy
      .createTestUser({
        isUserEmailValidated: true,
      })
      ?.then(({ emailAddress, finalPassword }) => {
        const returnUrl = `https://${Cypress.env(
          'BASE_URI',
        )}/signout?returnUrl=${encodeURIComponent(
          `https://${Cypress.env('BASE_URI')}/signin`,
        )}`;
        const visitUrl = `/signin?returnUrl=${encodeURIComponent(returnUrl)}`;
        cy.visit(visitUrl);
        cy.get('input[name=email]').type(emailAddress);
        cy.get('input[name=password]').type(finalPassword);
        cy.get('[data-cy="main-form-submit-button"]').click();
        cy.url().should('include', `/signin/success`);
        cy.url().should(
          'include',
          `returnUrl=${encodeURIComponent(
            'https://m.code.dev-theguardian.com/',
          )}`,
        );
        const checkbox = cy.findByLabelText('Yes, sign me up');
        checkbox.should('not.be.checked');
        checkbox.click();
        checkbox.should('be.checked');
        cy.findByText('Continue to the Guardian').click();
        cy.url().should('include', 'https://m.code.dev-theguardian.com/');
        cy.visit(
          `/signout?returnUrl=${encodeURIComponent(
            `https://${Cypress.env('BASE_URI')}/signin`,
          )}`,
        );
        cy.get('input[name=email]').type(emailAddress);
        cy.get('input[name=password]').type(finalPassword);
        cy.get('[data-cy="main-form-submit-button"]').click();
        cy.url().should('not.include', `/signin/success`);
        cy.url().should('include', 'https://m.code.dev-theguardian.com/');
      });
  });
});
