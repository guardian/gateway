/// <reference types="cypress" />

class VerifyEmail {
  static URL = '/verify-email';

  static CONTENT = {
    EMAIL_VERIFIED: 'Your email has been verified',
    LINK_EXPIRED: 'Link Expired',
    TOKEN_EXPIRED: 'Your email confirmation link has expired',
  };

  goto(token, { failOnStatusCode = true } = {}) {
    cy.visit(`${VerifyEmail.URL}${token ? `/${token}` : ''}`, {
      failOnStatusCode,
    });
  }
}

module.exports = VerifyEmail;
