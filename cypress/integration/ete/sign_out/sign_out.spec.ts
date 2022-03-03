describe('Sign out flow', () => {
  const DotComCookies = [
    'gu_user_features_expiry',
    'gu_paying_member',
    'gu_recurring_contributor',
    'gu_digital_subscriber',
  ];

  context('Signs a user out', () => {
    it('Removes IDAPI log in cookies and dotcom cookies when signing out', () => {
      cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
        req.reply(200);
      }).as('successRedirect');

      cy.createTestUser({
        isUserEmailValidated: true,
      })?.then(({ emailAddress, finalPassword }) => {
        cy.visit('/signin');
        cy.get('input[name=email]').type(emailAddress);
        cy.get('input[name=password]').type(finalPassword);

        DotComCookies.forEach((cookie) => {
          cy.setCookie(cookie, `the_${cookie}_cookie`, {
            domain: 'localhost',
          });
        });

        cy.get('[data-cy="sign-in-button"]').click();

        cy.wait('@successRedirect');
        cy.url().should('include', 'https://m.code.dev-theguardian.com/');
        cy.getCookie('SC_GU_U').should('exist');
        cy.getCookie('SC_GU_LA').should('exist');
        cy.getCookie('GU_U').should('exist');
        DotComCookies.forEach((cookie) => {
          cy.getCookie(cookie).should('exist');
        });

        cy.request('/signout');
        cy.getCookie('SC_GU_U').should('not.exist');
        cy.getCookie('SC_GU_LA').should('not.exist');
        cy.getCookie('GU_U').should('not.exist');
        DotComCookies.forEach((cookie) => {
          cy.getCookie(cookie).should('not.exist');
        });
      });
    });
  });
});
