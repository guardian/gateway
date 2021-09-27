/// <reference types='cypress' />
// This test depends on this Mailosaur account already being registered
const existing = {
  serverId: Cypress.env('MAILOSAUR_SERVER_ID'),
  serverDomain: Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
  email: 'signIn@' + Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
  password: 'existing_password',
};
describe('Registration flow', () => {
  it('links to the Google terms of service', () => {
    cy.visit('/signin');
    cy.contains('terms of service').click();
    cy.url().should('eq', 'https://policies.google.com/terms');

    // cy.contains("Google's Privacy Policy").should(
    //   'have.attr',
    //   'href',
    //   'https://policies.google.com/privacy',
    // );
    // cy.contains('terms & conditions').click();
    // cy.contains('Terms and conditions of use');
  });
});
