/// <reference types="cypress" />

class ResetPasswordPage {
  static URL = '/reset';
  static CONTENT = {
    ERRORS: {
      GENERIC: 'There was a problem resetting your password, please try again.',
      NO_ACCOUNT: 'There is no account for that email address, please check for typos or create an account',
      NO_EMAIL: 'Email field must not be blank.'
    }
  }

  goto() {
    cy.visit(ResetPasswordPage.URL);
  }

  submitEmailAddress(email) {
    cy.get('input[name="email"]')
    .type(email);
    
    this.clickResetPassword();
  }

  clickResetPassword() {
    cy.contains('Reset Password')
    .click();
  }
}

module.exports = ResetPasswordPage;
