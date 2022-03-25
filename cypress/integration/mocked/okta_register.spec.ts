describe('Okta Register flow', () => {
  context('Signed in user visits to /register with IDAPI cookies', () => {
    beforeEach(() => {
      cy.mockPurge();
    });
    it('should redirect to manage.theguardian.com if the SC_GU_U session cookie is set', () => {
      cy.setCookie('GU_U', 'the_GU_U_cookie');
      cy.setCookie('SC_GU_LA', 'the_SC_GU_LA_cookie');
      cy.setCookie('SC_GU_U', 'the_SC_GU_U_cookie');

      cy.mockPattern(
        200,
        {
          signInStatus: 'signedInNotRecently',
          userId: 'xxx',
          displayName: 'xxx',
          email: 'xxx',
          emailValidated: false,
          redirect: {
            url: 'xxx',
          },
        },
        '/auth/redirect',
      );

      cy.visit('/register?useOkta=true');

      cy.url().should(
        'eq',
        'https://profile.theguardian.com/signin?returnUrl=https%3A%2F%2Fmanage.theguardian.com%2F',
      );
    });

    it('should redirect to /register if the SU_GU_U session cookie is set but invalid', () => {
      cy.setCookie('GU_U', 'the_GU_U_cookie');
      cy.setCookie('SC_GU_LA', 'the_SC_GU_LA_cookie');
      cy.setCookie('SC_GU_U', 'the_SC_GU_U_cookie');

      cy.mockPattern(
        200,
        {
          signInStatus: 'signedOut',
          userId: 'xxx',
          displayName: 'xxx',
          email: 'xxx',
          emailValidated: false,
          redirect: {
            url: 'xxx',
          },
        },
        '/auth/redirect',
      );

      cy.visit('/register?useOkta=true');

      cy.url().should(
        'eq',
        'http://localhost:8861/register?returnUrl=https%3A%2F%2Fm.code.dev-theguardian.com&useOkta=true',
      );
      cy.getCookie('GU_U').should('not.exist');
      cy.getCookie('SC_GU_LA').should('not.exist');
      cy.getCookie('SC_GU_U').should('not.exist');
    });
  });

  context('Signed in user posts to /register', () => {
    beforeEach(() => {
      cy.mockPurge();
      cy.clearCookies();
      // we visit the healthcheck page to make sure the cookies are cleared from the browser
      cy.visit('/healthcheck');
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

      cy.setCookie('sid', `the_sid_cookie`);

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
        'https://profile.theguardian.com/signin?returnUrl=https%3A%2F%2Fmanage.theguardian.com%2F',
      );
    });

    it('should redirect to /register if the sid Okta session cookie is set, but invalid', () => {
      cy.mockPattern(404, '/api/v1/sessions/the_sid_cookie');

      cy.mockPattern(204, {}, '/api/v1/users/userId/sessions');

      cy.visit('/register?useOkta=true');

      cy.setCookie('sid', `the_sid_cookie`);

      cy.get('input[name="email"]').type('example@example.com');
      //mock the response from register
      cy.mockNext(200, {
        userType: 'new',
      });
      cy.mockNext(200, {
        status: 'success',
        errors: [],
      });

      cy.get('[data-cy=register-button]').click();

      cy.intercept('/register*').as('register');

      //we redirect to /register and unset the sid cookie, so we need to wait till the redirect has happened
      cy.wait('@register');

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

      cy.setCookie('sid', `the_sid_cookie`);

      cy.visit('/register?useOkta=true');

      cy.url().should(
        'eq',
        'https://profile.theguardian.com/signin?returnUrl=https%3A%2F%2Fmanage.theguardian.com%2F',
      );
    });

    it('should redirect to /register if the sid Okta session cookie is set but invalid', () => {
      cy.mockPattern(404, '/api/v1/sessions/the_sid_cookie');

      cy.mockPattern(204, {}, '/api/v1/users/userId/sessions');

      cy.setCookie('sid', `the_sid_cookie`);

      cy.visit('/healthcheck');

      cy.visit('/register?useOkta=true');

      cy.location('pathname').should('eq', '/register');

      cy.getCookie('sid').should('not.exist');
    });
  });
});
