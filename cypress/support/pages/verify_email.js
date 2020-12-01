/// <reference types="cypress" />

import * as qs from 'query-string';

class VerifyEmail {
  static URL = '/verify-email';

  static CONTENT = {
    EMAIL_VERIFIED: 'Your email has been verified',
    LINK_EXPIRED: 'Link Expired',
    TOKEN_EXPIRED: 'Your email confirmation link has expired',
    VERIFY_EMAIL: 'Verify Email',
    CONFIRM_EMAIL:
      'You need to confirm your email address to continue securely:',
    SEND_LINK: 'Send verification link',
    EMAIL_SENT: 'Email Sent. Please check your inbox and follow the link.',
    SIGN_IN: 'Sign in',
  };

  goto(token, { failOnStatusCode = true, query = {} } = {}) {
    const querystring = qs.stringify(query);

    cy.visit(
      `${VerifyEmail.URL}${token ? `/${token}` : ''}${
        querystring ? `?${querystring}` : ''
      }`,
      {
        failOnStatusCode,
      },
    );
  }
}

export default VerifyEmail;
