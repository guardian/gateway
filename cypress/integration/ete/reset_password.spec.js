/// <reference types='cypress' />

describe('Password reset flow', () => {
  context('Account exists', () => {
    // This test depends on this Mailosaur account already being registered
    const existing = {
      serverId: Cypress.env('MAILOSAUR_SERVER_ID'),
      get serverDomain() {
        return `${this.serverId}.mailosaur.net`;
      },
      get email() {
        return `passwordResetFlow@${this.serverDomain}`;
      },
    };

    it("changes the reader's password", () => {
      cy.intercept({
        method: 'GET',
        url: 'https://api.pwnedpasswords.com/range/*',
      }).as('breachCheck');
      cy.visit('/signin');
      cy.contains('Reset password').click();
      cy.contains('Forgotten password');
      cy.get('input[name=email]').type(existing.email);
      cy.get('[data-cy="reset-password-button"]').click();
      cy.contains('Check your email inbox');
      cy.mailosaurGetMessage(
        existing.serverId,
        {
          sentTo: existing.email,
        },
        {
          receivedAfter: new Date(),
        },
      ).then((email) => {
        // extract the reset token (so we can reset this reader's password)
        const match = email.html.body.match(/theguardian.com\/c\/([^"]*)/);
        const token = match[1];
        cy.visit(`/reset-password/${token}`);
        cy.get('input[name=password]').type('0298a96c-1028!@#');
        cy.wait('@breachCheck');
        cy.get('[data-cy="change-password-button"]').click();
        cy.contains('Password Changed');
        cy.mailosaurDeleteMessage(email.id);
      });
    });
  });
});
