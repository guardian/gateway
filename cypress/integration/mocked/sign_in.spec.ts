import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Sign in flow', () => {
  beforeEach(() => {
    cy.mockPurge();
    cy.fixture('users').as('users');
  });

  context('A11y checks', () => {
    it('Has no detectable a11y violations on sign in page', () => {
      cy.visit('/signin');
      injectAndCheckAxe();
    });

    it('Has no detectable a11y violations on sign in page with error', () => {
      cy.visit(
        '/signin?error=error&error_description=oh%20no%20somethings%20gone%20wrong',
      );
      cy.get('input[name="email"]').type('Invalid email');
      cy.get('input[name="password"]').type('Invalid password');
      cy.mockNext(500);
      cy.get('[data-cy=sign-in-button]').click();
      injectAndCheckAxe();
    });
  });

  context('Signing in - Identity API', () => {
    const defaultReturnUrl = 'https://m.code.dev-theguardian.com';
    it('shows an error message when sign in fails', function () {
      cy.visit('/signin?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout');
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.mockNext(403, {
        status: 'error',
        errors: [
          {
            message: 'Invalid email or password',
          },
        ],
      });
      cy.get('[data-cy=sign-in-button]').click();
      cy.contains('Email and password don’t match');
    });

    it('shows a generic error message when the api error response is not known', function () {
      cy.visit('/signin?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout');
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.mockNext(403, {
        status: 'error',
        errors: [
          {
            message: 'Bloopity flub',
          },
        ],
      });
      cy.get('[data-cy=sign-in-button]').click();
      cy.contains('There was a problem signing in, please try again');
    });

    it('loads the returnUrl upon successful authentication', function () {
      const returnUrl = 'https://www.theguardian.com/about';
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', returnUrl, (req) => {
        req.reply(200);
      });
      cy.visit(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.mockNext(200, {
        cookies: {
          values: [{ key: 'key', value: 'value' }],
          expiresAt: 'tomorrow',
        },
      });
      cy.get('[data-cy=sign-in-button]').click();
      cy.url().should('eq', returnUrl);
    });

    it('redirects to the default url if no returnUrl given', function () {
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
        req.reply(200);
      });

      cy.visit('/signin');
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.mockNext(200, {
        cookies: {
          values: [{ key: 'key', value: 'value' }],
          expiresAt: 'tomorrow',
        },
      });
      cy.get('[data-cy=sign-in-button]').click();
      cy.url().should('include', defaultReturnUrl);
    });
    it('auto-fills the email field when encryptedEmail is successfully decrypted', () => {
      cy.mockNext(200, {
        status: 'ok',
        email: 'test@test.com',
      });
      cy.visit(`/signin?encryptedEmail=bdfalrbagbgu`);
      cy.get('input[name="email"]').should('have.value', 'test@test.com');
    });
  });

  context.skip('Signing in - Okta (Skipped while feature disabled)', () => {
    const defaultReturnUrl = 'https://m.code.dev-theguardian.com';
    it('renders global error if there is the error_description parameter in url', function () {
      const error = 'There has been an error';
      cy.visit(`/signin?error_description=${encodeURIComponent(error)}`);
      cy.contains(error);
    });

    it('shows an error message when okta authentication fails', function () {
      cy.visit('/signin');
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.mockNext(401, {
        errorCode: 'E0000004',
        errorSummary: '',
        errorLink: '',
        errorId: '',
        errorCauses: [],
      });
      cy.get('[data-cy=sign-in-button]').click();
      cy.contains('Email and password don’t match');
    });

    it('shows a generic error message when okta rate limited', function () {
      cy.visit('/signin');
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.mockNext(429, {
        errorCode: 'E0000047',
        errorSummary: '',
        errorLink: '',
        errorId: '',
        errorCauses: [],
      });
      cy.get('[data-cy=sign-in-button]').click();
      cy.contains('There was a problem signing in, please try again.');
    });

    it('shows a generic error message when okta api response unknown', function () {
      cy.visit('/signin');
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.mockNext(403, {
        errorCode: 'E0000147',
        errorSummary: '',
        errorLink: '',
        errorId: '',
        errorCauses: [],
      });
      cy.get('[data-cy=sign-in-button]').click();
      cy.contains('There was a problem signing in, please try again.');
    });

    it('loads the redirectUrl upon successful authentication', function () {
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

      // we can't actually check the authorization code flow
      // so intercept the request and redirect to the guardian about page
      cy.intercept(
        `http://localhost:9000/oauth2/customauthserverid/v1/authorize*`,
        (req) => {
          req.redirect('https://theguardian.com/about');
        },
      );

      cy.get('[data-cy=sign-in-button]').click();
      cy.url().contains('https://theguardian.com/about');
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

      // we can't actually check the authorization code flow
      // so intercept the request and redirect to the guardian homepage
      cy.intercept(
        `http://localhost:9000/oauth2/customauthserverid/v1/authorize*`,
        (req) => {
          req.redirect(defaultReturnUrl);
        },
      );

      cy.get('[data-cy=sign-in-button]').click();
      cy.url().should('include', defaultReturnUrl);
    });
  });

  context('General IDAPI failure', () => {
    it('displays a generic error message', function () {
      cy.mockNext(500);
      cy.visit('/signin?returnUrl=https%3A%2F%2Flocalhost%3A8861%2Fsignin');
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.get('[data-cy=sign-in-button]').click();
      cy.contains('There was a problem signing in, please try again');
    });
  });
});
