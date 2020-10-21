class ChangePasswordPage {
  static URL = '/reset-password';
  static CONTENT = {
    ERRORS: {
      GENERIC: 'There was a problem changing your password, please try again.',
      PASSWORD_MISMATCH: 'The passwords don\'t match. Please review your password',
      PASSWORD_INVALID_LENGTH: 'This password isn\'t valid. Please include at least 6 characters.',
      PASSWORD_MISSING_NUMBER: 'This password isn\'t valid. Please include a symbol or a number.',
      PASSWORD_MULTIPLE_ERRORS: 'This password isn\'t valid. Please make sure it matches the required criteria.',
      PASSWORD_MISSING_UPPER_LOWERCASE: 'This password isn\'t valid. Please include a mixture of lower and upper case letters.',
      PASSWORD_TOO_LONG: 'This password isn\'t valid. Please include up to 72 characters.',
    },
    PASSWORD_CHANGE_SUCCESS_TITLE: 'Thank you! Your password has been changed.',
    CONTINUE_BUTTON_TEXT: 'Continue to The Guardian',
  };

  goto(token, returnUrl) {
    let url = `${ChangePasswordPage.URL}/${token}`;
    if (returnUrl) {
      url += `?returnUrl=${returnUrl}`;
    }
    cy.visit(url);
  }

  clickPasswordChange() {
    cy.contains('Save Password').click();
  }

  getInvalidPasswordChangeField() {
    return cy.get('input[name="password"]:invalid');
  }

  getInvalidPasswordChangeConfirmField() {
    return cy.get('input[name="password_confirm"]:invalid');
  }

  submitPasswordChange(password0, password1) {
    this.inputPasswordText(password0, password1);
    this.clickPasswordChange();
  }

  inputPasswordText(password0, password1) {
    if (password0) cy.get('input[name="password"]').type(password0);
    if (password1) cy.get('input[name="password_confirm"]').type(password1);
  }
}

module.exports = ChangePasswordPage;
