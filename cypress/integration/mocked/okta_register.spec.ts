describe('Okta Register flow', () => {
  const setSidCookie = () => {
    cy.setCookie('sid', `the_sid_cookie`, {
      domain: Cypress.env('BASE_URI'),
    });
  };

  context('Signed in user posts to /register', () => {
    beforeEach(() => {
      cy.mockPurge();
      cy.clearCookies();
      // we visit the healthcheck page to make sure the cookies are cleared from the browser
      cy.visit('/healthcheck');
      cy.disableCMP();
    });

    it('should redirect to manage.theguardian.com if the sid Okta session cookie is valid', () => {
      cy.mockPattern(
        200,
        {
          id: 'test',
          login: 'user@example.com',
          userId: 'userId',
          status: 'ACTIVE',
          expiresAt: '2016-01-03T09:13:17.000Z',
          lastPasswordVerification: '2016-01-03T07:02:00.000Z',
          lastFactorVerification: null,
          amr: ['pwd'],
          idp: {
            id: '01a2bcdef3GHIJKLMNOP',
            type: 'OKTA',
          },
          mfaActive: true,
        },
        '/api/v1/sessions/the_sid_cookie',
      );

      cy.intercept('https://manage.theguardian.com').as('manage');

      cy.mockPattern(204, {}, '/api/v1/users/userId/sessions');

      cy.visit('/register?useOkta=true');

      setSidCookie();

      cy.get('input[name="email"]').type('example@example.com');
      cy.mockNext(200, {
        userType: 'new',
      });
      cy.mockNext(200, {
        status: 'success',
        errors: [],
      });
      cy.get('[data-cy=register-button]').click();

      cy.url().should(
        'eq',
        'https://profile.code.dev-theguardian.com/signin?componentEventParams=componentType%3Didentityauthentication%26componentId%3Didapi_signin_redirect&returnUrl=https%3A%2F%2Fmanage.code.dev-theguardian.com%2F',
      );
    });

    it('should redirect to /register if the sid Okta session cookie is set, but invalid', () => {
      cy.mockPattern(404, '/api/v1/sessions/the_sid_cookie');

      cy.mockPattern(204, {}, '/api/v1/users/userId/sessions');

      setSidCookie();

      // visit healthcheck to set the cookie
      cy.visit('/healthcheck');

      cy.visit('/register?useOkta=true');

      cy.location('pathname').should('eq', '/register');

      cy.getCookie('sid').should('not.exist');
    });
  });

  context('Signed in user visits to /register', () => {
    beforeEach(() => {
      cy.mockPurge();
    });
    it('should redirect to manage.theguardian.com if the sid Okta session cookie is valid', () => {
      cy.mockPattern(
        200,
        {
          id: 'test',
          login: 'user@example.com',
          userId: 'userId',
          status: 'ACTIVE',
          expiresAt: '2016-01-03T09:13:17.000Z',
          lastPasswordVerification: '2016-01-03T07:02:00.000Z',
          lastFactorVerification: null,
          amr: ['pwd'],
          idp: {
            id: '01a2bcdef3GHIJKLMNOP',
            type: 'OKTA',
          },
          mfaActive: true,
        },
        '/api/v1/sessions/the_sid_cookie',
      );

      cy.mockPattern(204, {}, '/api/v1/users/userId/sessions');

      setSidCookie();

      // disable the cmp on the redirect
      cy.disableCMP();

      cy.visit('/register?useOkta=true');

      cy.url().should(
        'eq',
        'https://profile.code.dev-theguardian.com/signin?componentEventParams=componentType%3Didentityauthentication%26componentId%3Didapi_signin_redirect&returnUrl=https%3A%2F%2Fmanage.code.dev-theguardian.com%2F',
      );
    });

    it('should redirect to /register if the sid Okta session cookie is set but invalid', () => {
      cy.mockPattern(404, '/api/v1/sessions/the_sid_cookie');

      cy.mockPattern(204, {}, '/api/v1/users/userId/sessions');

      setSidCookie();

      // visit healthcheck to set the cookie
      cy.visit('/healthcheck');

      cy.visit('/register?useOkta=true');

      cy.location('pathname').should('eq', '/register');

      cy.getCookie('sid').should('not.exist');
    });
  });
});
