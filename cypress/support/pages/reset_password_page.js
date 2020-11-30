/// <reference types="cypress" />

class ResetPasswordPage {
  static URL = '/reset';
  static CONTENT = {
    ERRORS: {
      GENERIC: 'There was a problem resetting your password, please try again.',
      NO_ACCOUNT:
        'There is no account for that email address, please check for typos or create an account',
      NO_EMAIL: 'Email field must not be blank.',
    },
  };

  goto() {
    cy.visit(ResetPasswordPage.URL);
  }

  emailAddressField() {
    return cy.get('input[name="email"]');
  }

  invalidEmailAddressField() {
    return cy.get('input[name="email"]:invalid');
  }

  submitEmailAddress(email) {
    this.emailAddressField().type(email);
    this.clickResetPassword();
  }

  clickResetPassword() {
    cy.contains('Reset Password').click();
  }
}

export default ResetPasswordPage;
