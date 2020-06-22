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

  context.skip('Passwords do not match');
  context.skip('Enter password is left blank')
  context.skip('Enter and Confirm passwords left blank');
  context.skip('Valid password entered');
  context.skip('General IDAPI failure');

});
