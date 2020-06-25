/// <reference types="cypress" />

const ChangePasswordPage = require('../support/pages/change_password_page');

describe('Password change flow', () => {
  const page = new ChangePasswordPage();

  before(() => {
    cy.idapiMockPurge();
  });

  context('An expired/invalid token is used', () => {
    it('shows a resend password page', () => {
      const fakeToken = 'abcde';
      cy.idapiMock(500, {
        status: 'error',
        errors: [
          {
            message: 'Invalid token'
          }
        ]
      });
      page.goto(fakeToken);
    });
  });

  context('Passwords do not match', () => {
    it('shows a password mismatch error message', () => {
      const fakeToken = 'abcde';
      cy.idapiMock(200);
      page.goto(fakeToken);
      page.submitPasswordChange('password', 'mismatch');
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_MISMATCH);
    });
  });

  context('Enter and Confirm passwords left blank', () => {
    it('shows password blanks errors', () => {
      const fakeToken = 'abcde';
      cy.idapiMock(200);
      page.goto(fakeToken);
      page.clickPasswordChange();
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.PASSWORD_BLANK);
      cy.contains(ChangePasswordPage.CONTENT.ERRORS.CONFIRM_PASSWORD_BLANK);
    });
  });

  context('Valid password entered', () => {
    it('shows password change success screen, with a default redirect button.', () => {
      const fakeToken = 'abcde';
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
      const fakeToken = 'abcde';
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
      const fakeToken = 'abcde';
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
  context.skip('password too long');
  context.skip('password too short');


  context.skip('General IDAPI failure');

});
