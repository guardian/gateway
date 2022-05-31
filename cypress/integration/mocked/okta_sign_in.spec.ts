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
        url: '/signin?useOkta=true',
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
      cy.visit('/signin?useOkta=true');
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.mockNext(401, {
        errorCode: 'E0000004',
        errorSummary: 'errorSummary',
        errorLink: '',
        errorId: 'errorId',
        errorCauses: [],
      });
      cy.get('[data-cy=sign-in-button]').click();
      cy.contains("Email and password don't match");
    });

    it('shows a generic error message when okta rate limited', function () {
      cy.visit('/signin?useOkta=true');
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.mockNext(429, {
        errorCode: 'E0000047',
        errorSummary: 'errorSummary',
        errorLink: '',
        errorId: 'errorId',
        errorCauses: [],
      });
      cy.get('[data-cy=sign-in-button]').click();
      cy.contains('There was a problem signing in, please try again.');
    });

    it('shows a generic error message when okta api response unknown', function () {
      cy.visit('/signin?useOkta=true');
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.mockNext(403, {
        errorCode: 'E0000147',
        errorSummary: 'errorSummary',
        errorLink: '',
        errorId: 'errorId',
        errorCauses: [],
      });
      cy.get('[data-cy=sign-in-button]').click();
      cy.contains('There was a problem signing in, please try again.');
    });

    it('loads the redirectUrl upon successful authentication', function () {
      cy.visit(
        '/signin?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout&useOkta=true',
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

      cy.get('[data-cy=sign-in-button]').click();
      cy.wait('@authRedirect').then(() => {
        cy.url().should('include', 'https://www.theguardian.com/about');
      });
    });

    it('redirects to the default url if no redirectUrl given', function () {
      cy.visit('/signin?useOkta=true');
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

      cy.get('[data-cy=sign-in-button]').click();
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

      cy.get('[data-cy=sign-in-button]').click();
      cy.wait('@authRedirect').then(() => {
        cy.url().should('include', 'https://m.code.dev-theguardian.com/');
      });
    });
  });
});
