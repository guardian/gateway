/// <reference types='cypress' />
// This test depends on this Mailosaur account already being registered
const existing = {
  serverId: Cypress.env('MAILOSAUR_SERVER_ID'),
  serverDomain: Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
  email: 'signIn@' + Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
  password: 'existing_password',
};
describe('Sign in flow', () => {
  const returnUrl =
    'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';
  it('links to the Google terms of service page', () => {
    cy.visit('/signin');
    cy.contains('terms of service').click();
    cy.url().should('eq', 'https://policies.google.com/terms');
  });
  it('links to the Google privacy policy page', () => {
    cy.visit('/signin');
    cy.contains('This site is protected by reCAPTCHA and the Google')
      .contains('privacy policy')
      .click();
    cy.url().should('eq', 'https://policies.google.com/privacy');
  });
  it('links to the Guardian terms and conditions page', () => {
    cy.visit('/signin');
    cy.contains('terms & conditions').click();
    cy.url().should('eq', 'https://www.theguardian.com/help/terms-of-service');
  });
  it('links to the Guardian privacy policy page', () => {
    cy.visit('/signin');
    cy.contains('For information about how we use your data')
      .contains('privacy policy')
      .click();
    cy.url().should('eq', 'https://www.theguardian.com/help/privacy-policy');
  });

  it('shows a message when credentials are invalid', () => {
    cy.visit('/signin');
    cy.get('input[name=email]').type('invalid@doesnotexist.com');
    cy.get('input[name=password]').type('password');
    cy.get('[data-cy="sign-in-button"]').click();
    cy.contains('This email and password combination is not valid');
  });

  it('correctly signs in an existing user', () => {
    cy.visit('/signin');
    cy.get('input[name=email]').type(existing.email);
    cy.get('input[name=password]').type(existing.password);
    cy.get('[data-cy="sign-in-button"]').click();
    cy.url().should('include', 'https://m.code.dev-theguardian.com/');
  });

  it('navigates to reset password', () => {
    cy.visit('/signin');
    cy.contains('Reset password').click();
    cy.contains('Forgotten password');
  });

  it('navigates to magic link', () => {
    cy.visit('/signin');
    cy.contains('email me a link').click();
    cy.contains('Link to sign in');
  });

  it('navigates to registration', () => {
    cy.visit('/signin');
    cy.contains('Register').click();
    cy.get('[data-cy="register-button"]').should('be.visible');
  });

  it('respects the returnUrl query param', () => {
    cy.visit(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
    cy.get('input[name=email]').type(existing.email);
    cy.get('input[name=password]').type(existing.password);
    cy.get('[data-cy="sign-in-button"]').click();
    cy.url().should('eq', returnUrl);
  });

  // This functionality is still todo. Remove `skip` from this test once the returnUrl parameter is passed through
  it.skip('redirects correctly for social sign in', () => {
    cy.visit(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
    cy.get('[data-cy="google-sign-in-button"]').should(
      'have.attr',
      'href',
      `https://oauth.theguardian.com/google/signin?returnUrl=${encodeURIComponent(
        returnUrl,
      )}`,
    );
    cy.get('[data-cy="facebook-sign-in-button"]').should(
      'have.attr',
      'href',
      `https://oauth.theguardian.com/facebook/signin?returnUrl=${encodeURIComponent(
        returnUrl,
      )}`,
    );
    cy.get('[data-cy="apple-sign-in-button"]').should(
      'have.attr',
      'href',
      `https://oauth.theguardian.com/apple/signin?returnUrl=${encodeURIComponent(
        returnUrl,
      )}`,
    );
  });
});
