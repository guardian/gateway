/// <reference types="cypress" />

const ChangePasswordPage = require('../support/pages/change_password_page');

describe('Password change flow', () => {
  const page =  new ChangePasswordPage();

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

  context.skip('Valid password entered');
  context.skip('General IDAPI failure');

});
