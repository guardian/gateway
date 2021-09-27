/// <reference types='cypress' />
// This test depends on this Mailosaur account already being registered
const existing = {
  serverId: Cypress.env('MAILOSAUR_SERVER_ID'),
  serverDomain: Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
  email: 'signIn@' + Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
  password: 'existing_password',
};

describe('Registration flow', () => {
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
});
