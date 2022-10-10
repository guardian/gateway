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

    it('should redirect to homepage if the sid Okta session cookie is valid', () => {
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

      cy.intercept('POST', '/register**').as('registerPost');

      cy.visit('/register');

      setSidCookie();

      cy.get('input[name="email"]').type('example@example.com');
      cy.mockNext(200, {
        userType: 'new',
      });
      cy.mockNext(200, {
        status: 'success',
        errors: [],
      });
      cy.get('[data-cy=main-form-submit-button]').click();

      cy.contains('Sign in to the Guardian');
      cy.contains('You are signed in with');
      cy.contains('user@example.com');
      cy.contains('Continue')
        .should('have.attr', 'href')
        .and('include', 'https://m.code.dev-theguardian.com');
      cy.contains('a', 'Sign in')
        .should('have.attr', 'href')
        .and(
          'include',
          '/signout?returnUrl=https%253A%252F%252Fprofile.thegulocal.com%252Fsignin',
        );
      cy.contains('Sign in with a different email');
    });

    it('should redirect to /reauthenticate if the sid Okta session cookie is set, but invalid', () => {
      cy.mockPattern(404, '/api/v1/sessions/the_sid_cookie');

      cy.mockPattern(204, {}, '/api/v1/users/userId/sessions');

      setSidCookie();

      // visit healthcheck to set the cookie
      cy.visit('/healthcheck');

      cy.visit('/register');

      cy.location('pathname').should('eq', '/reauthenticate');

      cy.getCookie('sid').should('not.exist');
    });
  });

  context('Signed in user visits /register', () => {
    beforeEach(() => {
      cy.mockPurge();
    });
    it('should redirect to homepage if the sid Okta session cookie is valid', () => {
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

      cy.visit('/register');

      cy.contains('Sign in to the Guardian');
      cy.contains('You are signed in with');
      cy.contains('user@example.com');
      cy.contains('Continue')
        .should('have.attr', 'href')
        .and('include', 'https://m.code.dev-theguardian.com');
      cy.contains('a', 'Sign in')
        .should('have.attr', 'href')
        .and(
          'include',
          '/signout?returnUrl=https%253A%252F%252Fprofile.thegulocal.com%252Fsignin',
        );
      cy.contains('Sign in with a different email');
    });

    it('should redirect to /reauthenticate if the sid Okta session cookie is set but invalid', () => {
      cy.mockPattern(404, '/api/v1/sessions/the_sid_cookie');

      cy.mockPattern(204, {}, '/api/v1/users/userId/sessions');

      setSidCookie();

      // visit healthcheck to set the cookie
      cy.visit('/healthcheck');

      cy.visit('/register');

      cy.location('pathname').should('eq', '/reauthenticate');

      cy.getCookie('sid').should('not.exist');
    });
  });
});
