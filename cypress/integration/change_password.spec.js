/// <reference types="cypress" />

const ChangePasswordPage = require('../support/pages/change_password_page');
const ResendPasswordPage = require('../support/pages/resend_password_page');
const ResendPasswordResetPage = require('../support/pages/resend_password_page');

describe('Password change flow', () => {
  const page = new ChangePasswordPage();
  const fakeToken = 'abcde';

  before(() => {
    cy.idapiMockPurge();
  });

  context('An expired/invalid token is used', () => {
    it('shows a resend password page', () => {
      cy.idapiMock(500, {
        status: 'error',
        errors: [
          {
            message: 'Invalid token'
          }
        ]
      });
      page.goto(fakeToken);
      cy.contains(ResendPasswordResetPage.CONTENT.PAGE_TITLE);
    });
  });

  context('Passwords do not match', () => {
    it('shows a password mismatch error message', () => {
      cy.idapiMock(200);
      page.goto(fakeToken);
      page.submitPasswordChange('password', 'mismatch');
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_MISMATCH);
    });
  });

  context('Enter and Confirm passwords left blank', () => {
    it('shows password blanks errors', () => {
      cy.idapiMock(200);
      page.goto(fakeToken);
      page.clickPasswordChange();
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_BLANK);
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.CONFIRM_PASSWORD_BLANK);
    });
  });

  context('Valid password entered', () => {
    it('shows password change success screen, with a default redirect button.', () => {
      const fakeSuccessResponse = {
        cookies: {
          values: [
            {
              key: 'GU_U',
              value: 'FAKE_VALUE_0'
            },
            {
              key: 'SC_GU_LA',
              value: 'FAKE_VALUE_1',
              sessionCookie: true
            },
            {
              key: 'SC_GU_U',
              value: 'FAKE_VALUE_2'
            }
          ],
          expiresAt: 1
        }
      };

      cy.idapiMock(200);
      cy.idapiMock(200, fakeSuccessResponse);
      page.goto(fakeToken);
      page.submitPasswordChange('password123', 'password123');
      cy.contains(ChangePasswordPage.CONTENT.PASSWORD_CHANGE_SUCCESS_TITLE);
      cy.contains(ChangePasswordPage.CONTENT.CONTINUE_BUTTON_TEXT)
        .should('have.attr', 'href', `${Cypress.env('DEFAULT_RETURN_URI')}/`);

      // Not currently possible to test login cookie,
      // Cookie is not set to domain we can access, even in cypress.
      // e.g.
      // cy.getCookie('GU_U')
      //  .should('have.property', 'value', 'FAKE_VALUE_0');
    });
  });

  context('Valid password entered and a return url with a Guardian domain is specified.', () => {
    it('shows password change success screen, with a redirect button linking to the return url.', () => {
      const returnUrl = 'https://news.theguardian.com';
      const fakeSuccessResponse = {
        cookies: {
          values: [
            {
              key: 'GU_U',
              value: 'FAKE_VALUE_0'
            },
            {
              key: 'SC_GU_LA',
              value: 'FAKE_VALUE_1',
              sessionCookie: true
            },
            {
              key: 'SC_GU_U',
              value: 'FAKE_VALUE_2'
            }
          ],
          expiresAt: 1
        }
      };

      cy.idapiMock(200);
      cy.idapiMock(200, fakeSuccessResponse);
      page.goto(fakeToken, returnUrl);
      page.submitPasswordChange('password123', 'password123');
      cy.contains(ChangePasswordPage.CONTENT.PASSWORD_CHANGE_SUCCESS_TITLE);
      cy.contains(ChangePasswordPage.CONTENT.CONTINUE_BUTTON_TEXT)
        .should('have.attr', 'href', `${returnUrl}/`);
    });
  });

  context('Valid password entered and an return url from a non-Guardian domain is specified.', () => {
    it('shows password change success screen, with a default redirect button.', () => {
      const returnUrl = 'https://news.badsite.com';
      const fakeSuccessResponse = {
        cookies: {
          values: [
            {
              key: 'GU_U',
              value: 'FAKE_VALUE_0'
            },
            {
              key: 'SC_GU_LA',
              value: 'FAKE_VALUE_1',
              sessionCookie: true
            },
            {
              key: 'SC_GU_U',
              value: 'FAKE_VALUE_2'
            }
          ],
          expiresAt: 1
        }
      };

      cy.idapiMock(200);
      cy.idapiMock(200, fakeSuccessResponse);
      page.goto(fakeToken, returnUrl);
      page.submitPasswordChange('password123', 'password123');
      cy.contains(ChangePasswordPage.CONTENT.PASSWORD_CHANGE_SUCCESS_TITLE);
      cy.contains(ChangePasswordPage.CONTENT.CONTINUE_BUTTON_TEXT)
        .should('have.attr', 'href', `${Cypress.env('DEFAULT_RETURN_URI')}/`);
    });
  });

  context('password too short', () => {
    it('shows an error showing the password length must be within certain limits', () => {
      cy.idapiMock(200);
      page.goto(fakeToken);
      page.submitPasswordChange('p', 'p');
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_INVALID_LENGTH);
    });
  });
  context('password too long', () => {
    it('shows an error showing the password length must be within certain limits', () => {
      const excessivelyLongPassword = Array.from(Array(73), () => 'a').join('');
      cy.idapiMock(200);
      page.goto(fakeToken);
      page.submitPasswordChange(excessivelyLongPassword, excessivelyLongPassword);
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_INVALID_LENGTH);
    });
  });

  context('General IDAPI failure on token read', () => {
    it('displays the password resend page', () => {
      cy.idapiMock(500);
      page.goto(fakeToken);
      cy.contains(ResendPasswordResetPage.CONTENT.PAGE_TITLE);
    });
  });

  context('General IDAPI failure on password change', () => {
    it('displays a generic error message', () => {
      cy.idapiMock(200);
      cy.idapiMock(500);
      page.goto(fakeToken);
      page.submitPasswordChange('password123', 'password123');
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.GENERIC);
    });
  });
});
