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

      cy.visit('/signin');
      cy.get('input[name=email]').type('example@example.com');
      cy.get('input[name=password]').type('password');

      // mock IDAPI sign-in cookie response
      cy.mockNext(200, {
        status: 'ok',
        cookies: {
          values: [
            {
              key: 'GU_U',
              value: 'the_GU_U_cookie',
            },
            {
              key: 'SC_GU_LA',
              value: 'the_SC_GU_LA_cookie',
              sessionCookie: true,
            },
            {
              key: 'SC_GU_U',
              value: 'the_SC_GU_U_cookie',
            },
          ],
          expiresAt: 'tomorrow',
        },
      });

      DotComCookies.forEach((cookie) => {
        cy.setCookie(cookie, `the_${cookie}_cookie`, {
          domain: 'localhost',
        });
      });

      cy.get('[data-cy="sign-in-button"]').click();
      cy.wait('@successRedirect');

      cy.getCookie('SC_GU_U').should('exist');
      cy.getCookie('SC_GU_LA').should('exist');
      cy.getCookie('GU_U').should('exist');
      DotComCookies.forEach((cookie) => {
        cy.getCookie(cookie).should('exist');
      });

      // mock IDAPI sign-out cookie response
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

      cy.request('/signout').then(() => {
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
});
