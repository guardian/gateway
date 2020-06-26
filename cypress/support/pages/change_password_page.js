class ChangePasswordPage {
  static URL = '/reset-password';
  static CONTENT = {
    ERRORS: {
      GENERIC: 'There was a problem changing your password, please try again.',
      PASSWORD_MISMATCH: 'The passwords do not match, please try again',
      PASSWORD_BLANK: 'Password field must not be blank',
      CONFIRM_PASSWORD_BLANK: 'Repeat Password field must not be blank',
      PASSWORD_INVALID_LENGTH: 'Password must be between 6 and 72 characters'
    },
    PASSWORD_CHANGE_SUCCESS_TITLE: 'Thank you! Your password has been changed.',
    CONTINUE_BUTTON_TEXT: 'Continue to The Guardian'
  }

  goto(token, returnUrl) {
    let url = `${ChangePasswordPage.URL}/${token}`;
    if(returnUrl) {
      url += `?returnUrl=${returnUrl}`
    }
    cy.visit(url);
  }

  clickPasswordChange() {
    cy.contains('Save Password')
      .click();
  }

  submitPasswordChange(password0, password1) {
    cy.get('input[name="password"]')
      .type(password0);
    cy.get('input[name="password_confirm"]')
      .type(password1);
    this.clickPasswordChange();
  }
}

module.exports = ChangePasswordPage;
