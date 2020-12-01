class ChangePasswordPage {
  static URL = '/reset-password';
  static CONTENT = {
    ERRORS: {
      GENERIC: 'There was a problem changing your password, please try again.',
      PASSWORD_BREACHED: 'This is a common password. Please use a password that is hard to guess.',
      PASSWORD_MISMATCH: 'Passwords don’t match',
      PASSWORD_TOO_SHORT: 'Please make sure your password is at least 8 characters long.',
      PASSWORD_TOO_LONG: 'Please make sure your password is not longer than 72 characters.',
      CSRF:
        'Sorry, something went wrong. If you made any changes these might have not been saved. Please try again.',
    },
    PASSWORD_CHANGE_SUCCESS_TITLE: 'Thank you! Your password has been changed.',
    CONTINUE_BUTTON_TEXT: 'Continue to The Guardian',
    PASSWORDS_MATCH: 'Passwords match',
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

  invalidPasswordChangeField() {
    return cy.get('input[name="password"]:invalid');
  }

  invalidPasswordChangeConfirmField() {
    return cy.get('input[name="password_confirm"]:invalid');
  }

  typePasswordChange(password0, password1) {
    cy.get('input[name="password"]').type(password0);
    cy.get('input[name="password_confirm"]').type(password1);
  }

  submitPasswordChange(password0, password1) {
    this.typePasswordChange(password0, password1);
    this.clickPasswordChange();
  }

}

export default ChangePasswordPage;
