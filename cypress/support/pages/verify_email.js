/// <reference types="cypress" />

class VerifyEmail {
  static URL = '/verify-email';

  static CONTENT = {
    EMAIL_VERIFIED: 'Your email has been verified',
  };

  goto(token) {
    cy.visit(`${VerifyEmail.URL}${token ? `/${token}` : ''}`);
  }
}

module.exports = VerifyEmail;
