import { authCookieResponse } from '../../support/idapi/cookie';

describe('Sign out flow', () => {
  const DotComCookies = [
    'gu_user_features_expiry',
    'gu_paying_member',
    'gu_recurring_contributor',
    'gu_digital_subscriber',
  ];

  context('Signs a user out', () => {
    beforeEach(() => {
      cy.mockPurge();
    });

    it('Removes IDAPI log in cookies and dotcom cookies when signing out', () => {
      const returnUrl = `https://${Cypress.env('BASE_URI')}/reset-password`;
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.visit(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.mockNext(200, {
        status: 'ok',
        ...authCookieResponse,
      });
      cy.get('[data-cy=sign-in-button]').click();
      cy.url().should('eq', returnUrl);

      cy.getCookie('SC_GU_U').should('exist');
      cy.getCookie('SC_GU_LA').should('exist');
      cy.getCookie('GU_U').should('exist');

      cy.mockNext(200, {
        status: 'ok',
        cookies: {
          values: [
            {
              key: 'GU_SO',
              value: 'the_GU_SO_cookie',
            },
          ],
          expiresAt: new Date(Date.now() + 1800000 /* 30min */).toISOString(),
        },
      });

      cy.visit(`/signout?returnUrl=${encodeURIComponent(returnUrl)}`);
      cy.getCookie('GU_SO').should('exist');
      cy.getCookie('SC_GU_U').should('not.exist');
      cy.getCookie('SC_GU_LA').should('not.exist');
      cy.getCookie('GU_U').should('not.exist');
      DotComCookies.forEach((cookie) => {
        cy.getCookie(cookie).should('not.exist');
      });
    });
  });
});
