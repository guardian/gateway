/// <reference types='cypress' />

const unregisteredAccount = {
  serverId: Cypress.env('MAILOSAUR_SERVER_ID'),
  serverDomain: Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
  email:
    'registrationTest+' +
    window.crypto.randomUUID() +
    '@' +
    Cypress.env('MAILOSAUR_SERVER_ID') +
    '.mailosaur.net',
  password: 'test_password',
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
  it.only('successfully registers using an email with no existing account', () => {
    cy.visit('/register');
    cy.get('input[name=email').type(unregisteredAccount.email);
    cy.get('[data-cy="register-button"]').click();

    cy.contains('Email sent');
    cy.contains(unregisteredAccount.email);
    cy.contains('Resend email');
    cy.contains('Change email address');
  });
});
