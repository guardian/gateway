/// <reference types="cypress" />

import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Password set/create flow', () => {
  const fakeValidationRespone = (timeUntilExpiry?: number) => ({
    user: {
      primaryEmailAddress: 'name@example.com',
    },
    timeUntilExpiry,
  });

  const fakeSuccessResponse = {
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
    it('Has no detectable a11y violations on resend password page', () => {
      cy.mockNext(500, {
        status: 'error',
        errors: [
          {
            message: 'Invalid token',
          },
        ],
      });
      cy.visit(`/set-password/fake_token`);
      injectAndCheckAxe();
    });

    it('Has no detectable a11y violations on create/set password page', () => {
      cy.mockNext(200);
      cy.mockNext(200, fakeSuccessResponse);
      cy.visit(`/set-password/fake_token`);
      injectAndCheckAxe();
    });

    it('Has no detectable a11y violations on create/set password page with error', () => {
      cy.mockNext(200);
      cy.visit(`/set-password/fake_token`);
      cy.get('input[name="password"]').type('short');
      cy.get('button[type="submit"]').click();
      injectAndCheckAxe();
    });

    it('Has no detectable a11y violations on create/set password complete page', () => {
      cy.mockNext(200);
      cy.mockNext(200, fakeSuccessResponse);
      cy.intercept({
        method: 'GET',
        url: 'https://api.pwnedpasswords.com/range/*',
      }).as('breachCheck');
      cy.visit(`/set-password/fake_token`);
      cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
      cy.wait('@breachCheck');
      cy.get('button[type="submit"]').click();
      injectAndCheckAxe();
    });
  });

  context('show / hide password eye button', () => {
    it('clicking on the password eye shows the password and clicking it again hides it', () => {
      cy.mockNext(200);
      cy.visit(`/set-password/fake_token`);
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
      cy.get('input[name="password"]').type('some_password');
      cy.get('[data-cy=password-input-eye-button]').click();
      cy.get('input[name="password"]').should('have.attr', 'type', 'text');
      cy.get('[data-cy=password-input-eye-button]').click();
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    });
  });

  context('An expired/invalid token is used', () => {
    it('shows a resend password page', () => {
      cy.mockNext(500, {
        status: 'error',
        errors: [
          {
            message: 'Invalid token',
          },
        ],
      });
      cy.visit(`/set-password/fake_token`);
      cy.contains('Link expired');
    });

    it('does not allow email resend if reCAPTCHA check fails', () => {
      cy.mockNext(500, {
        status: 'error',
        errors: [
          {
            message: 'Invalid token',
          },
        ],
      });
      cy.visit(`/set-password/fake_token`);
      cy.contains('Link expired');
      cy.get('input[name="email"]').type('some@email.com');
      cy.intercept('POST', 'https://www.google.com/recaptcha/api2/**', {
        statusCode: 500,
      });
      cy.get('button[type="submit"]').click();
      cy.contains('Google reCAPTCHA verification failed. Please try again.');
      cy.get('button[type="submit"]').click();
      cy.contains('Google reCAPTCHA verification failed.');
      cy.contains('If the problem persists please try the following:');
      cy.contains('userhelp@');
    });

    it('shows the session time out page if the token expires while on the set password page', () => {
      cy.mockNext(200, fakeValidationRespone(1000));
      cy.visit(`/set-password/fake_token`);
      cy.contains('Session timed out');
    });
  });

  context('Email shown on page', () => {
    it('shows the users email address on the page', () => {
      cy.mockNext(200, fakeValidationRespone());
      cy.visit(`/set-password/fake_token`);
      cy.contains(fakeValidationRespone().user.primaryEmailAddress);
    });
  });

  context('Valid password entered', () => {
    it('shows password set success screen, with a default redirect button.', () => {
      cy.mockNext(200);
      cy.mockNext(200, fakeSuccessResponse);
      cy.intercept({
        method: 'GET',
        url: 'https://api.pwnedpasswords.com/range/*',
      }).as('breachCheck');
      cy.visit(`/set-password/fake_token`);

      cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
      cy.wait('@breachCheck');
      cy.get('button[type="submit"]').click();
      cy.contains('Password created');
      cy.contains('Continue to the Guardian').should(
        'have.attr',
        'href',
        `${Cypress.env('DEFAULT_RETURN_URI')}/`,
      );
    });

    it('shows password change success screen, with default redirect button, and users email', () => {
      cy.mockNext(200, fakeValidationRespone());
      cy.mockNext(200, fakeSuccessResponse);
      cy.intercept({
        method: 'GET',
        url: 'https://api.pwnedpasswords.com/range/*',
      }).as('breachCheck');
      cy.visit(`/set-password/fake_token`);
      cy.contains(fakeValidationRespone().user.primaryEmailAddress);

      cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
      cy.wait('@breachCheck');
      cy.get('button[type="submit"]').click();
      cy.contains('Password created');
      cy.contains('Continue to the Guardian').should(
        'have.attr',
        'href',
        `${Cypress.env('DEFAULT_RETURN_URI')}/`,
      );
      cy.contains(fakeValidationRespone().user.primaryEmailAddress);
    });
  });

  context(
    'Valid password entered and a return url with a Guardian domain is specified.',
    () => {
      it('shows password created success screen, with a redirect button linking to the return url.', () => {
        cy.mockNext(200);
        cy.mockNext(200, fakeSuccessResponse);
        cy.intercept({
          method: 'GET',
          url: 'https://api.pwnedpasswords.com/range/*',
        }).as('breachCheck');
        cy.visit(
          `/set-password/fake_token?returnUrl=https://news.theguardian.com`,
        );
        cy.get('input[name="password"]').type(
          'thisisalongandunbreachedpassword',
        );
        cy.wait('@breachCheck');
        cy.get('button[type="submit"]').click();
        cy.contains('Password created');
        cy.contains('Continue to the Guardian').should(
          'have.attr',
          'href',
          'https://news.theguardian.com/',
        );
      });
    },
  );

  context(
    'Valid password entered and an return url from a non-Guardian domain is specified.',
    () => {
      it('shows password created success screen, with a default redirect button.', () => {
        cy.mockNext(200);
        cy.mockNext(200, fakeSuccessResponse);
        cy.intercept({
          method: 'GET',
          url: 'https://api.pwnedpasswords.com/range/*',
        }).as('breachCheck');
        cy.visit(`/set-password/fake_token?returnUrl=https://news.badsite.com`);
        cy.get('input[name="password"]').type(
          'thisisalongandunbreachedpassword',
        );
        cy.wait('@breachCheck');
        cy.get('button[type="submit"]').click();
        cy.contains('Password created');
        cy.contains('Continue to the Guardian').should(
          'have.attr',
          'href',
          `${Cypress.env('DEFAULT_RETURN_URI')}/`,
        );
      });
    },
  );

  context('General IDAPI failure on token read', () => {
    it('displays the password resend page', () => {
      cy.mockNext(500);
      cy.visit(`/set-password/fake_token`);
      cy.contains('Link expired');
    });
  });

  context('General IDAPI failure on password change', () => {
    it('displays a generic error message', () => {
      cy.mockNext(200);
      cy.mockNext(500);
      cy.mockNext(200);
      cy.intercept({
        method: 'GET',
        url: 'https://api.pwnedpasswords.com/range/*',
      }).as('breachCheck');
      cy.visit(`/set-password/fake_token`);
      cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
      cy.wait('@breachCheck');
      cy.get('button[type="submit"]').click();
      cy.contains(
        'There was a problem changing your password, please try again.',
      );
    });
  });
});
