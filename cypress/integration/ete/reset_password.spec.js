/// <reference types='cypress' />

describe('Password reset flow', () => {
  context('Account exists', () => {
    // This test depends on this Mailslurp account already being registered
    const existing = {
      email: 'a1ae9048-2823-45a0-a0e1-89e8f7a22420@mailslurp.com',
      inbox: 'a1ae9048-2823-45a0-a0e1-89e8f7a22420',
    };

    it("changes the reader's password", () => {
      cy.emptyInbox(existing.inbox).then(() => {
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
        cy.waitForLatestEmail(existing.inbox).then((email) => {
          // extract the reset token (so we can reset this reader's password)
          const match = email.body.match(/theguardian.com\/c\/([^"]*)/);
          const token = match[1];
          cy.visit(`/reset-password/${token}`);
          cy.get('input[name=password]').type('0298a96c-1028!@#');
          cy.wait('@breachCheck');
          cy.get('[data-cy="change-password-button"]').click();
          cy.contains('Password Changed');
        });
      });
    });
  });
});
