
class ChangePasswordPage {
  static URL = '/reset-password';
  static CONTENT = {
    ERRORS: {
      PASSWORD_MISMATCH: 'The passwords do not match, please try again'
    }
  }

  goto(token) {
    cy.visit(`${ChangePasswordPage.URL}/${token}`);
  }

  submitPasswordChange(password0, password1) {
    cy.get('input[name="password"]')
      .type(password0);
    cy.get('input[name="password_confirm"]')
      .type(password1);
    cy.contains('Save Password')
      .click();
  }
}

module.exports = ChangePasswordPage;
