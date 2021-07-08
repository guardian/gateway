/// <reference types="cypress" />

import { injectAndCheckAxe } from '../support/cypress-axe';
import ChangePasswordPage from '../support/pages/change_password_page';
import ResendPasswordResetPage from '../support/pages/resend_password_page';

describe('Password change flow', () => {
  const page = new ChangePasswordPage();
  const fakeToken = 'abcde';

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
      page.goto(fakeToken);
      injectAndCheckAxe();
    });

    it('Has no detectable a11y violations on change password page', () => {
      cy.mockNext(200);
      cy.mockNext(200, fakeSuccessResponse);
      page.goto(fakeToken);
      injectAndCheckAxe();
    });

    it('Has no detectable a11y violations on change password page with error', () => {
      cy.mockNext(200);
      page.goto(fakeToken);
      page.submitPasswordChange('thisisalongandunbreachedpassword', 'mismatch');
      injectAndCheckAxe();
    });

    it('Has no detectable a11y violations on change password complete page', () => {
      cy.mockNext(200);
      cy.mockNext(200, fakeSuccessResponse);
      page.goto(fakeToken);
      page.submitPasswordChange(
        'thisisalongandunbreachedpassword',
        'thisisalongandunbreachedpassword',
      );
      injectAndCheckAxe();
    });
  });

  context('show / hide password eye button', () => {
    it('shows the password eye when the input box is selected and hides it when it is not selected', () => {
      cy.mockNext(200);
      page.goto(fakeToken);
      cy.get('.password-input-eye-symbol').should('not.exist');
      cy.get('input[name="password"]').click();
      cy.get('.password-input-eye-symbol').should('exist');
      cy.contains('Reset Password').click();
      cy.get('.password-input-eye-symbol').should('not.exist');
    });

    it('clicking on the password eye shows the password and clicking it again hides it', () => {
      cy.mockNext(200);
      page.goto(fakeToken);
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
      page.goto(fakeToken);
      cy.contains(ResendPasswordResetPage.CONTENT.PAGE_TITLE);
    });
  });

  context('Passwords do not match', () => {
    it('shows a password mismatch error message', () => {
      cy.mockNext(200);
      page.goto(fakeToken);
      page.submitPasswordChange('thisisalongandunbreachedpassword', 'mismatch');
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_MISMATCH);
    });
  });

  context('Password exists in breach dataset', () => {
    it('displays a breached error', () => {
      cy.mockNext(200);
      page.goto(fakeToken);
      page.submitPasswordChange('password', 'password');
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_BREACHED);
    });
  });

  context('CSRF token error on submission', () => {
    it('should fail on submission due to CSRF token failure if CSRF token cookie is not sent', () => {
      cy.mockNext(200);
      page.goto(fakeToken);
      cy.clearCookie('_csrf');
      page.submitPasswordChange(
        'thisisalongandunbreachedpassword',
        'thisisalongandunbreachedpassword',
      );
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.CSRF);
    });
  });

  context('Enter and Confirm passwords left blank', () => {
    it('uses the standard HTML5 empty field validation', () => {
      cy.mockNext(200);
      page.goto(fakeToken);
      page.clickPasswordChange();
      page.invalidPasswordChangeField().should('have.length', 1);
      page.invalidPasswordChangeConfirmField().should('have.length', 1);
    });
  });

  context('Valid password entered', () => {
    it('shows password change success screen, with a default redirect button.', () => {
      cy.mockNext(200);
      cy.mockNext(200, fakeSuccessResponse);
      page.goto(fakeToken);

      page.typePasswordChange(
        'thisisalongandunbreachedpassword',
        'thisisalongandunbreachedpassword',
      );
      cy.contains(ChangePasswordPage.CONTENT.PASSWORDS_MATCH);
      page.clickPasswordChange();

      cy.contains(ChangePasswordPage.CONTENT.PASSWORD_CHANGE_SUCCESS_TITLE);
      cy.contains(ChangePasswordPage.CONTENT.CONTINUE_BUTTON_TEXT).should(
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
        const returnUrl = 'https://news.theguardian.com';

        cy.mockNext(200);
        cy.mockNext(200, fakeSuccessResponse);
        page.goto(fakeToken, returnUrl);
        page.submitPasswordChange(
          'thisisalongandunbreachedpassword',
          'thisisalongandunbreachedpassword',
        );
        cy.contains(ChangePasswordPage.CONTENT.PASSWORD_CHANGE_SUCCESS_TITLE);
        cy.contains(ChangePasswordPage.CONTENT.CONTINUE_BUTTON_TEXT).should(
          'have.attr',
          'href',
          `${returnUrl}/`,
        );
      });
    },
  );

  context(
    'Valid password entered and an return url from a non-Guardian domain is specified.',
    () => {
      it('shows password change success screen, with a default redirect button.', () => {
        const returnUrl = 'https://news.badsite.com';

        cy.mockNext(200);
        cy.mockNext(200, fakeSuccessResponse);
        page.goto(fakeToken, returnUrl);
        page.submitPasswordChange(
          'thisisalongandunbreachedpassword',
          'thisisalongandunbreachedpassword',
        );
        cy.contains(ChangePasswordPage.CONTENT.PASSWORD_CHANGE_SUCCESS_TITLE);
        cy.contains(ChangePasswordPage.CONTENT.CONTINUE_BUTTON_TEXT).should(
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
      page.goto(fakeToken);
      cy.mockNext(200);
      page.typePasswordChange('p', 'p');

      // Error is shown before clicking submit
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_TOO_SHORT);
      page.clickPasswordChange();
      // Error still exists after clicking submit
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_TOO_SHORT);
    });
  });

  context('password too long', () => {
    it('shows an error showing the password length must be within certain limits', () => {
      const excessivelyLongPassword = Array.from(Array(73), () => 'a').join('');
      cy.mockNext(200);
      page.goto(fakeToken);
      cy.mockNext(200);
      page.typePasswordChange(excessivelyLongPassword, excessivelyLongPassword);
      // Error is shown before clicking submit
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_TOO_LONG);
      page.clickPasswordChange();
      // Error still exists after clicking submit
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_TOO_LONG);
    });
  });

  context('General IDAPI failure on token read', () => {
    it('displays the password resend page', () => {
      cy.mockNext(500);
      page.goto(fakeToken);
      cy.contains(ResendPasswordResetPage.CONTENT.PAGE_TITLE);
    });
  });

  context('General IDAPI failure on password change', () => {
    it('displays a generic error message', () => {
      cy.mockNext(200);
      cy.mockNext(500);
      page.goto(fakeToken);
      page.submitPasswordChange(
        'thisisalongandunbreachedpassword',
        'thisisalongandunbreachedpassword',
      );
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.GENERIC);
    });
  });
});
