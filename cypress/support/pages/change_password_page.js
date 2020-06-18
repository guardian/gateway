const URL = '/reset-password';

class ChangePasswordPage {
  goto(token) {
    cy.visit(`${URL}/${token}`);
  }
}

module.exports = ChangePasswordPage;
