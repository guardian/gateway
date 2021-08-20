import { injectAndCheckAxe } from '../../support/cypress-axe';
import {
  authRedirectSignInRecentlyEmailValidated,
  AUTH_REDIRECT_ENDPOINT,
} from '../../support/idapi/auth';
import { allConsents, CONSENTS_ENDPOINT } from '../../support/idapi/consent';
import { setAuthCookies } from '../../support/idapi/cookie';
import {
  verifiedUserWithNoConsent,
  USER_ENDPOINT,
} from '../../support/idapi/user';
import * as qs from 'query-string';
import CommunicationsPage from '../../support/pages/onboarding/communications_page.js';

describe('Welcome and set password page', () => {
  const checkTokenSuccessResponse = {
    user: {
      primaryEmailAddress: 'test@example.com',
    },
  };

  const fakeCookieSuccessResponse = {
    cookies: {
      values: [
        {
          key: 'GU_U',
          value: 'FAKE_VALUE_0',
        },
        {
          key: 'SC_GU_LA',
          value: 'FAKE_VALUE_1',
          sessionCookie: true,
        },
        {
          key: 'SC_GU_U',
          value: 'FAKE_VALUE_2',
        },
      ],
      expiresAt: 1,
    },
  };

  beforeEach(() => {
    cy.mockPurge();
  });

  context('A11y checks', () => {
    it('has no detectable a11y violations on the set password page', () => {
      cy.mockNext(200, checkTokenSuccessResponse);
      cy.visit(`/welcome/fake_token`);
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on set password page with global error', () => {
      cy.mockNext(200, checkTokenSuccessResponse);
      cy.visit(`/welcome/fake_token`);
      cy.mockNext(500);
      cy.get('input[name="password"]').type('short');
      cy.get('button[type="submit"]').click();
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on the resend page', () => {
      cy.visit(`/welcome/resend`);
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on the resend page with global error', () => {
      cy.visit(`/welcome/resend`);

      cy.mockNext(500);
      cy.get('input[name="email"]').type(
        checkTokenSuccessResponse.user.primaryEmailAddress,
      );
      cy.get('button[type="submit"]').click();
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on the email sent page with resend box', () => {
      cy.visit(`/welcome/resend`);

      cy.mockNext(200);
      cy.get('input[name="email"]').type(
        checkTokenSuccessResponse.user.primaryEmailAddress,
      );
      cy.get('button[type="submit"]').click();
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on the email sent page without resend box', () => {
      cy.visit(`/welcome/email-sent`);
      injectAndCheckAxe();
    });
  });

  // successful token, set password page is displayed, redirect to consents flow if valid password
  context('An valid token is used and set password page is displayed', () => {
    it('redirects to onboarding flow if a valid password is set', () => {
      cy.mockNext(200, checkTokenSuccessResponse);
      cy.intercept({
        method: 'GET',
        url: 'https://api.pwnedpasswords.com/range/*',
      }).as('breachCheck');
      cy.mockNext(200, fakeCookieSuccessResponse);
      cy.mockAll(
        200,
        authRedirectSignInRecentlyEmailValidated,
        AUTH_REDIRECT_ENDPOINT,
      );
      cy.mockAll(200, allConsents, CONSENTS_ENDPOINT);
      cy.mockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
      setAuthCookies();

      cy.visit(`/welcome/fake_token`);
      cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
      cy.wait('@breachCheck');
      cy.get('button[type="submit"]').click();
      cy.contains('Thank you for registering');
    });

    it('redirects to onboarding flow if valid password is set and preserves returnUrl', () => {
      const returnUrl = encodeURIComponent(
        `https://www.theguardian.com/science/grrlscientist/2012/aug/07/3`,
      );
      const query = qs.stringify({ returnUrl });

      cy.mockNext(200, checkTokenSuccessResponse);
      cy.intercept({
        method: 'GET',
        url: 'https://api.pwnedpasswords.com/range/*',
      }).as('breachCheck');
      cy.mockNext(200, fakeCookieSuccessResponse);
      cy.mockAll(
        200,
        authRedirectSignInRecentlyEmailValidated,
        AUTH_REDIRECT_ENDPOINT,
      );
      cy.mockAll(200, allConsents, CONSENTS_ENDPOINT);
      cy.mockAll(200, verifiedUserWithNoConsent, USER_ENDPOINT);
      setAuthCookies();

      cy.visit(`/welcome/fake_token?${query}`);
      cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
      cy.wait('@breachCheck');
      cy.get('button[type="submit"]').click();
      cy.contains('Thank you for registering');
      cy.url().should('include', CommunicationsPage.URL);
      cy.url().should('include', `returnUrl=${returnUrl}`);
    });

    it('shows an error if the password is invalid', () => {
      cy.mockNext(200, checkTokenSuccessResponse);
      cy.mockNext(400, {
        status: 'error',
        errors: [
          {
            message: 'Breached password',
          },
        ],
      });
      cy.visit(`/welcome/fake_token`);
      cy.get('input[name="password"]').type('password');
      cy.get('button[type="submit"]').click();
      cy.contains('This is a common password.');
    });
  });

  context('An expired/invalid token is used', () => {
    it('shows the link expired page to type email, and on submit shows the email sent page, with a button to resend the email', () => {
      cy.mockNext(500, {
        status: 'error',
        errors: [
          {
            message: 'Invalid token',
          },
        ],
      });
      cy.mockNext(200);
      cy.mockNext(200);
      cy.visit(`/welcome/fake_token`);
      cy.contains('Link expired');
      cy.get('input[name="email"]').type(
        checkTokenSuccessResponse.user.primaryEmailAddress,
      );
      cy.get('button[type="submit"]').click();
      cy.contains('Check your email inbox');
      cy.contains(checkTokenSuccessResponse.user.primaryEmailAddress);
      cy.contains('Resend email');
    });
  });

  context('Email sent page', () => {
    it('resends email if button exists', () => {
      cy.visit(`/welcome/resend`);

      cy.mockNext(200);
      cy.get('input[name="email"]').type(
        checkTokenSuccessResponse.user.primaryEmailAddress,
      );
      cy.get('button[type="submit"]').click();

      cy.mockNext(200);
      cy.get('button[type="submit"]').click();
      cy.contains('Email sent');
    });

    it('takes user back to link expired page if "Change email address" clicked', () => {
      cy.visit(`/welcome/resend`);

      cy.mockNext(200);
      cy.get('input[name="email"]').type(
        checkTokenSuccessResponse.user.primaryEmailAddress,
      );
      cy.get('button[type="submit"]').click();

      cy.contains('Change email address').click();

      cy.contains('Link expired');
    });
  });
});
