class ChangePasswordPage {
  static URL = '/reset-password';
  static CONTENT = {
    ERRORS: {
      GENERIC: 'There was a problem changing your password, please try again.',
      PASSWORD_MISMATCH: 'The passwords do not match, please try again',
      PASSWORD_INVALID_LENGTH: 'Password must be between 8 and 72 characters',
      CSRF: 'Sorry, something went wrong. If you made any changes these might have not been saved. Please try again.',
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
    cy.get('input[name="password"]').type(password0);
    cy.get('input[name="password_confirm"]').type(password1);
    this.clickPasswordChange();
  }
}

module.exports = ChangePasswordPage;
