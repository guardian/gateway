
class ChangePasswordPage {
  static URL = '/reset-password';
  static CONTENT = {
    ERRORS: {
      PASSWORD_MISMATCH: 'The passwords do not match, please try again',
      PASSWORD_BLANK: 'Password field must not be blank',
      CONFIRM_PASSWORD_BLANK: 'Repeat Password field must not be blank'
    }
  }

  goto(token) {
    cy.visit(`${ChangePasswordPage.URL}/${token}`);
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
