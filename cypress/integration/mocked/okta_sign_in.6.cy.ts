describe('Sign in flow', () => {
  context('Signing in - Okta', () => {
    beforeEach(() => {
      cy.mockPurge();
    });

    it('loads the homepage if user is already authenticated', function () {
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

      // disable the cmp  on the redirect
      cy.disableCMP();

      cy.request({
        url: '/signin',
        followRedirect: false,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(302);
        expect(response.redirectedToUrl).to.eq(
          'https://m.code.dev-theguardian.com/',
        );
      });
    });

    it('shows an error message when okta authentication fails', function () {
      cy.visit('/signin');
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.mockNext(401, {
        errorCode: 'E0000004',
        errorSummary: 'errorSummary',
        errorLink: '',
        errorId: 'errorId',
        errorCauses: [],
      });
      cy.get('[data-cy=main-form-submit-button]').click();
      cy.contains("Email and password don't match");
    });

    it('shows a generic error message when okta rate limited', function () {
      cy.visit('/signin');
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.mockNext(429, {
        errorCode: 'E0000047',
        errorSummary: 'errorSummary',
        errorLink: '',
        errorId: 'errorId',
        errorCauses: [],
      });
      cy.get('[data-cy=main-form-submit-button]').click();
      cy.contains('There was a problem signing in, please try again.');
    });

    it('shows a generic error message when okta api response unknown', function () {
      cy.visit('/signin');
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.mockNext(403, {
        errorCode: 'E0000147',
        errorSummary: 'errorSummary',
        errorLink: '',
        errorId: 'errorId',
        errorCauses: [],
      });
      cy.get('[data-cy=main-form-submit-button]').click();
      cy.contains('There was a problem signing in, please try again.');
    });

    it('loads the redirectUrl upon successful authentication for validated user', function () {
      cy.visit('/signin?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout');
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.mockNext(200, {
        expiresAt: '3000-01-01T00:00:00.000Z',
        status: 'SUCCESS',
        sessionToken: 'some-session-token',
        _embedded: {
          user: {
            id: 'okta-id',
            passwordChanged: '2020-01-01T00:00:00.000Z',
            profile: {
              login: 'test.man@example.com',
              firstName: 'Test',
              lastName: 'Man',
              locale: 'en_GB',
              timeZone: 'Europe/London',
            },
          },
        },
      });

      cy.mockNext(200, [
        {
          id: '123',
          profile: {
            name: 'GuardianUser-EmailValidated',
            description: 'User has validated their email',
          },
        },
      ]);

      // we can't actually check the authorization code flow
      // so intercept the request and redirect to the guardian about page
      cy.intercept(
        `http://localhost:9000/oauth2/${Cypress.env(
          'OKTA_CUSTOM_OAUTH_SERVER',
        )}/v1/authorize*`,
        (req) => {
          req.redirect('https://www.theguardian.com/about');
        },
      ).as('authRedirect');

      cy.get('[data-cy=main-form-submit-button]').click();
      cy.wait('@authRedirect').then(() => {
        cy.url().should('include', 'https://www.theguardian.com/about');
      });
    });

    it('loads the redirectUrl upon Okta success but with unvalidated user, and IDAPI successful authentication', function () {
      const returnUrl = 'https://profile.thegulocal.com/healthcheck';
      cy.visit(
        '/signin?returnUrl=https%3A%2F%2Fprofile.thegulocal.com%2Fhealthcheck',
      );
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');

      cy.mockNext(200, {
        expiresAt: '3000-01-01T00:00:00.000Z',
        status: 'SUCCESS',
        sessionToken: 'some-session-token',
        _embedded: {
          user: {
            id: 'okta-id',
            passwordChanged: '2020-01-01T00:00:00.000Z',
            profile: {
              login: 'test.man@example.com',
              firstName: 'Test',
              lastName: 'Man',
              locale: 'en_GB',
              timeZone: 'Europe/London',
            },
          },
        },
      });
      //User is not in the email validated group, so we return an empty response for the group membership api
      cy.mockNext(200, []);

      cy.mockNext(200, {
        cookies: {
          values: [{ key: 'SC_GU_U', value: 'value' }],
          expiresAt: new Date(Date.now() + 1800000 /* 30min */).toISOString(),
        },
      });

      cy.get('[data-cy=main-form-submit-button]').click();

      cy.url().should('include', returnUrl);

      cy.getCookie('sid').should('not.exist');
      cy.getCookie('SC_GU_U').should('exist');
    });

    it('errors upon Okta non success status  but with unvalidated user and will not try IDAPI authentication', function () {
      // authentication can result in many non success status values - https://developer.okta.com/docs/reference/api/authn/#transaction-state

      cy.visit(
        '/signin?returnUrl=https%3A%2F%2Fprofile.thegulocal.com%2Fhealthcheck',
      );
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');

      cy.mockNext(200, {
        expiresAt: '3000-01-01T00:00:00.000Z',
        status: 'MFA_CHALLENGE',
        sessionToken: 'some-session-token',
        _embedded: {
          user: {
            id: 'okta-id',
            passwordChanged: '2020-01-01T00:00:00.000Z',
            profile: {
              login: 'test.man@example.com',
              firstName: 'Test',
              lastName: 'Man',
              locale: 'en_GB',
              timeZone: 'Europe/London',
            },
          },
        },
      });
      //User is not in the email validated group, so we return an empty response for the group membership api
      cy.mockNext(200, []);

      cy.mockNext(200, {
        cookies: {
          values: [{ key: 'SC_GU_U', value: 'value' }],
          expiresAt: new Date(Date.now() + 1800000 /* 30min */).toISOString(),
        },
      });

      cy.get('[data-cy=main-form-submit-button]').click();

      cy.contains('There was a problem signing in, please try again.');
    });

    it('redirects to the default url if no redirectUrl given', function () {
      cy.visit('/signin');
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.mockNext(200, {
        expiresAt: '3000-01-01T00:00:00.000Z',
        status: 'SUCCESS',
        sessionToken: 'some-session-token',
        _embedded: {
          user: {
            id: 'okta-id',
            passwordChanged: '2020-01-01T00:00:00.000Z',
            profile: {
              login: 'test.man@example.com',
              firstName: 'Test',
              lastName: 'Man',
              locale: 'en_GB',
              timeZone: 'Europe/London',
            },
          },
        },
      });

      cy.mockNext(200, [
        {
          id: '123',
          profile: {
            name: 'GuardianUser-EmailValidated',
            description: 'User has validated their email',
          },
        },
      ]);

      // we can't actually check the authorization code flow
      // so intercept the request and redirect to the default return URL
      cy.intercept(
        `http://localhost:9000/oauth2/${Cypress.env(
          'OKTA_CUSTOM_OAUTH_SERVER',
        )}/v1/authorize*`,
        (req) => {
          req.redirect('https://m.code.dev-theguardian.com/');
        },
      ).as('authRedirect');

      cy.get('[data-cy=main-form-submit-button]').click();
      cy.wait('@authRedirect').then(() => {
        cy.url().should('include', 'https://m.code.dev-theguardian.com/');
      });
    });
  });
});
