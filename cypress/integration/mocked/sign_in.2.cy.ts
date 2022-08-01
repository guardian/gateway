import { stringify } from 'query-string';

import { injectAndCheckAxe } from '../../support/cypress-axe';
import { allConsents, CONSENTS_ENDPOINT } from '../../support/idapi/consent';
import {
  verifiedUserWithNoConsent,
  createUser,
  USER_ENDPOINT,
} from '../../support/idapi/user';

describe('Sign in flow', () => {
  beforeEach(() => {
    cy.mockPurge();
  });

  context('A11y checks', () => {
    it('Has no detectable a11y violations on sign in page', () => {
      cy.visit('/signin');
      injectAndCheckAxe();
    });

    it('Has no detectable a11y violations on sign in page with error', () => {
      cy.visit('/signin');
      cy.get('input[name="email"]').type('Invalid email');
      cy.get('input[name="password"]').type('Invalid password');
      cy.mockNext(500);
      cy.get('[data-cy=sign-in-button]').click();
      injectAndCheckAxe();
    });
  });

  context('Signing in', () => {
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
      cy.contains("Email and password don't match");
      cy.get('input[name="email"]').should('have.value', 'example@example.com');
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
          expiresAt: new Date(Date.now() + 1800000 /* 30min */).toISOString(),
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
          expiresAt: new Date(Date.now() + 1800000 /* 30min */).toISOString(),
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

    it('shows recaptcha error message when reCAPTCHA token request fails', () => {
      cy.visit('/signin?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout');
      cy.get('input[name="email"]').type('placeholder@example.com');
      cy.get('input[name="password"]').type('definitelynotarealpassword');
      cy.intercept('POST', 'https://www.google.com/recaptcha/api2/**', {
        statusCode: 500,
      });
      cy.get('[data-cy=sign-in-button]').click();
      cy.contains('Google reCAPTCHA verification failed. Please try again.');
    });

    it('shows detailed recaptcha error message when reCAPTCHA token request fails two times', () => {
      // Intercept "Report this error" link because we just check it is linked to.
      cy.intercept(
        'GET',
        'https://manage.theguardian.com/help-centre/contact-us',
        {
          statusCode: 200,
        },
      );
      cy.visit('/signin?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout');
      cy.get('input[name="email"]').type('placeholder@example.com');
      cy.get('input[name="password"]').type('definitelynotarealpassword');
      cy.intercept('POST', 'https://www.google.com/recaptcha/api2/**', {
        statusCode: 500,
      });
      cy.get('[data-cy=sign-in-button]').click();
      cy.contains('Google reCAPTCHA verification failed. Please try again.');
      cy.get('[data-cy=sign-in-button]').click();
      cy.contains('Google reCAPTCHA verification failed.');
      cy.contains('If the problem persists please try the following:');
      cy.contains('Report this error').click();
      cy.url().should(
        'eq',
        'https://manage.theguardian.com/help-centre/contact-us',
      );
    });

    it('redirects to homepage when user with existing valid session visits signin page', () => {
      cy.setCookie('SC_GU_U', 'sessionvalue');
      cy.setCookie('SC_GU_LA', 'la_value');

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
      cy.mockNext(200, {
        status: 'signedInRecently',
        emailValidated: true,
      });
    });

    it('redirects to /reauthenticate when user with existing invalid session visits signin page', () => {
      cy.setCookie('SC_GU_U', 'sessionvalue');
      cy.setCookie('SC_GU_LA', 'la_value');

      cy.mockNext(200, {
        status: 'signedInNotRecently',
        emailValidated: true,
      });
      cy.visit('/signin');

      cy.location('pathname').should('eq', '/reauthenticate');
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

  context('Redirect to post sign-in prompt', () => {
    const defaultReturnUrl = 'https://m.code.dev-theguardian.com';
    const returnUrl = 'https://www.theguardian.com/about';

    beforeEach(() => {
      cy.mockAll(200, allConsents, CONSENTS_ENDPOINT);
      cy.mockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
      // Intercept the pages that we would redirect to.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', '/signin/success*', (req) => {
        req.reply(200);
      });
      cy.intercept('GET', defaultReturnUrl, (req) => {
        req.reply(200);
      });
      cy.intercept('GET', returnUrl, (req) => {
        req.reply(200);
      });
    });

    const signIn = (returnUrl = defaultReturnUrl) => {
      cy.visit(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
      cy.get('input[name="email"]').type('example@example.com');
      cy.get('input[name="password"]').type('password');
      cy.mockNext(200, {
        cookies: {
          values: [{ key: 'SC_GU_U', value: 'something' }],
          expiresAt: new Date(Date.now() + 1800000 /* 30min */).toISOString(),
        },
      });
      cy.get('[data-cy=sign-in-button]').click();
    };

    it('if all conditions met', () => {
      signIn();
      cy.url().should(
        'include',
        `/signin/success?returnUrl=${encodeURIComponent(defaultReturnUrl)}`,
      );
    });

    it('unless returnUrl is not default', () => {
      signIn(returnUrl);
      cy.url().should('include', returnUrl);
    });

    it('unless experiment already viewed', () => {
      cy.setCookie(
        'GU_ran_experiments',
        stringify({ OptInPromptPostSignIn: Date.now() }),
      );
      signIn();
      cy.url().should('include', defaultReturnUrl);
    });

    it('if no consent information for user', () => {
      cy.mockAll(200, createUser([]), USER_ENDPOINT);
      signIn();
      cy.url().should(
        'include',
        `/signin/success?returnUrl=${encodeURIComponent(defaultReturnUrl)}`,
      );
    });

    it('unless user has already consented', () => {
      const supporterConsent = allConsents.find(({ id }) => id === 'supporter');
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const consentData = [{ ...supporterConsent!, consented: true }];
      cy.mockAll(200, createUser(consentData), USER_ENDPOINT);
      signIn();
      cy.url().should('include', defaultReturnUrl);
    });

    it('unless fetching consents fails', () => {
      cy.mockAll(500, undefined, CONSENTS_ENDPOINT);
      signIn();
      cy.url().should('include', defaultReturnUrl);
    });

    it('unless fetching user consents fails', () => {
      cy.mockAll(500, undefined, USER_ENDPOINT);
      signIn();
      cy.url().should('include', defaultReturnUrl);
    });
  });
});
