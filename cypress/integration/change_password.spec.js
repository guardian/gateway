/// <reference types="cypress" />

import { injectAndCheckAxe } from '../support/cypress-axe';

describe('Password change flow', () => {
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
      cy.visit(`/reset-password/fake_token`);
      injectAndCheckAxe();
    });

    it('Has no detectable a11y violations on change password page', () => {
      cy.mockNext(200);
      cy.mockNext(200, fakeSuccessResponse);
      cy.visit(`/reset-password/fake_token`);
      injectAndCheckAxe();
    });

    it('Has no detectable a11y violations on change password page with error', () => {
      cy.mockNext(200);
      cy.visit(`/reset-password/fake_token`);
      cy.get('input[name="password"]').type('short');
      // there seems to be a race condition on the change password page
      // adding a small wait fixes the issue
      cy.wait(300);
      cy.get('button[type="submit"]').click();
      injectAndCheckAxe();
    });

    it('Has no detectable a11y violations on change password complete page', () => {
      cy.mockNext(200);
      cy.mockNext(200, fakeSuccessResponse);
      cy.visit(`/reset-password/fake_token`);
      cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
      // there seems to be a race condition on the change password page
      // adding a small wait fixes the issue
      cy.wait(300);
      cy.get('button[type="submit"]').click();
      injectAndCheckAxe();
    });
  });

  context('show / hide password eye button', () => {
    it('shows the password eye when the input box is selected and hides it when it is not selected', () => {
      cy.mockNext(200);
      cy.visit(`/reset-password/fake_token`);
      cy.get('.password-input-eye-symbol').should('not.exist');
      cy.get('input[name="password"]').click();
      cy.get('.password-input-eye-symbol').should('exist');
      cy.contains('Set Password').click();
      cy.get('.password-input-eye-symbol').should('not.exist');
    });

    it('clicking on the password eye shows the password and clicking it again hides it', () => {
      cy.mockNext(200);
      cy.visit(`/reset-password/fake_token`);
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
      cy.get('input[name="password"]').type('some_password');
      cy.get('.password-input-eye-button').eq(0).click();
      cy.get('input[name="password"]').should('have.attr', 'type', 'text');
      cy.get('.password-input-eye-button').eq(0).click();
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
      cy.visit(`/reset-password/fake_token`);
      cy.contains('link expired');
    });
  });

  context('Password exists in breach dataset', () => {
    it('displays a breached error', () => {
      cy.mockNext(200);
      cy.visit(`/reset-password/fake_token`);
      cy.get('input[name="password"]').type('password');
      // there seems to be a race condition on the change password page
      // adding a small wait fixes the issue
      cy.wait(300);
      cy.get('button[type="submit"]').click();
      cy.contains('common password');
    });
  });

  context('CSRF token error on submission', () => {
    it('should fail on submission due to CSRF token failure if CSRF token cookie is not sent', () => {
      cy.mockNext(200);
      cy.visit(`/reset-password/fake_token`);
      cy.clearCookie('_csrf');
      cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
      // there seems to be a race condition on the change password page
      // adding a small wait fixes the issue
      cy.wait(300);
      cy.get('button[type="submit"]').click();
      cy.contains('Please try again.');
    });
  });

  context('Enter and Confirm passwords left blank', () => {
    it('uses the standard HTML5 empty field validation', () => {
      cy.mockNext(200);
      cy.visit(`/reset-password/fake_token`);
      // there seems to be a race condition on the change password page
      // adding a small wait fixes the issue
      cy.wait(300);
      cy.get('button[type="submit"]').click();
      cy.get('input[name="password"]:invalid').should('have.length', 1);
    });
  });

  context('Valid password entered', () => {
    it('shows password change success screen, with a default redirect button.', () => {
      cy.mockNext(200);
      cy.mockNext(200, fakeSuccessResponse);
      cy.visit(`/reset-password/fake_token`);

      cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
      // there seems to be a race condition on the change password page
      // adding a small wait fixes the issue
      cy.wait(600);
      cy.get('button[type="submit"]').click();
      cy.contains('Thank you! Your password has been changed.');
      cy.contains('Continue to The Guardian').should(
        'have.attr',
        'href',
        `${Cypress.env('DEFAULT_RETURN_URI')}/`,
      );

      // Not currently possible to test login cookie,
      // Cookie is not set to domain we can access, even in cypress.
      // e.g.
      // cy.getCookie('GU_U')
      //  .should('have.property', 'value', 'FAKE_VALUE_0');
    });
  });

  context(
    'Valid password entered and a return url with a Guardian domain is specified.',
    () => {
      it('shows password change success screen, with a redirect button linking to the return url.', () => {
        cy.mockNext(200);
        cy.mockNext(200, fakeSuccessResponse);
        cy.visit(
          `/reset-password/fake_token?returnUrl=https://news.theguardian.com`,
        );
        cy.get('input[name="password"]').type(
          'thisisalongandunbreachedpassword',
        );
        // there seems to be a race condition on the change password page
        // adding a small wait fixes the issue
        cy.wait(600);
        cy.get('button[type="submit"]').click();
        cy.contains('Thank you! Your password has been changed.');
        cy.contains('Continue to The Guardian').should(
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
      it('shows password change success screen, with a default redirect button.', () => {
        cy.mockNext(200);
        cy.mockNext(200, fakeSuccessResponse);
        cy.visit(
          `/reset-password/fake_token?returnUrl=https://news.badsite.com`,
        );
        cy.get('input[name="password"]').type(
          'thisisalongandunbreachedpassword',
        );
        // there seems to be a race condition on the change password page
        // adding a small wait fixes the issue
        cy.wait(800);
        cy.get('button[type="submit"]').click();
        cy.contains('Thank you! Your password has been changed.');
        cy.contains('Continue to The Guardian').should(
          'have.attr',
          'href',
          `${Cypress.env('DEFAULT_RETURN_URI')}/`,
        );
      });
    },
  );

  context('password too short', () => {
    it('shows an error showing the password length must be within certain limits', () => {
      cy.mockNext(200);
      cy.visit(`/reset-password/fake_token`);
      cy.mockNext(200);
      cy.get('input[name="password"]').type('p');
      cy.get('button[type="submit"]').focus();
      // Error is shown before clicking submit
      cy.contains('At least 8');
      // there seems to be a race condition on the change password page
      // adding a small wait fixes the issue
      cy.wait(300);
      cy.get('button[type="submit"]').click();
      // Error still exists after clicking submit
      cy.contains(
        'Please make sure your password is at least 8 characters long.',
      );
    });
  });

  context('password too long', () => {
    it('shows an error showing the password length must be within certain limits', () => {
      const excessivelyLongPassword = Array.from(Array(73), () => 'a').join('');
      cy.mockNext(200);
      cy.visit(`/reset-password/fake_token`);
      cy.mockNext(200);
      cy.get('input[name="password"]').type(excessivelyLongPassword);
      cy.get('button[type="submit"]').focus();
      // Error is shown before clicking submit
      cy.contains('Maximum of 72');
      // there seems to be a race condition on the change password page
      // adding a small wait fixes the issue
      cy.wait(300);
      cy.get('button[type="submit"]').click();
      // Error still exists after clicking submit
      cy.contains(
        'Please make sure your password is not longer than 72 characters.',
      );
    });
  });

  context('General IDAPI failure on token read', () => {
    it('displays the password resend page', () => {
      cy.mockNext(500);
      cy.visit(`/reset-password/fake_token`);
      cy.contains('link expired');
    });
  });

  context('General IDAPI failure on password change', () => {
    it('displays a generic error message', () => {
      cy.mockNext(200);
      cy.mockNext(500);
      cy.visit(`/reset-password/fake_token`);
      cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
      // there seems to be a race condition on the change password page
      // adding a small wait fixes the issue
      cy.wait(300);
      cy.get('button[type="submit"]').click();
      cy.contains(
        'There was a problem changing your password, please try again.',
      );
    });
  });
});
