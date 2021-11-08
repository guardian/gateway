describe('Password reset flow', () => {
  context('Account exists', () => {
    // This test depends on this Mailosaur account already being registered
    const existing = {
      serverId: Cypress.env('MAILOSAUR_SERVER_ID'),
      serverDomain: Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
      email:
        'passwordResetFlow@' +
        Cypress.env('MAILOSAUR_SERVER_ID') +
        '.mailosaur.net',
    };

    it("changes the reader's password", () => {
      cy.intercept({
        method: 'GET',
        url: 'https://api.pwnedpasswords.com/range/*',
      }).as('breachCheck');
      cy.visit('/signin');
      const timeRequestWasMade = new Date();
      cy.contains('Reset password').click();
      cy.contains('Forgot password');
      cy.get('input[name=email]').type(existing.email);
      cy.get('[data-cy="main-form-submit-button"]').click();
      cy.contains('Check your email inbox');
      cy.mailosaurGetMessage(
        existing.serverId,
        {
          sentTo: existing.email,
        },
        {
          receivedAfter: timeRequestWasMade,
        },
      ).then((email) => {
        cy.getEmailDetails(
          email,
          /theguardian.com\/reset-password\/([^"]*)/,
        ).then(({ token, id }) => {
          cy.visit(`/reset-password/${token}`);
          cy.get('input[name=password]').type('0298a96c-1028!@#');
          cy.wait('@breachCheck');
          cy.get('[data-cy="change-password-button"]').click();
          cy.contains('Password updated');
          cy.contains(existing.email.toLowerCase());
          cy.mailosaurDeleteMessage(id);
        });
      });
    });
  });
});

describe('Password set flow', () => {
  context('Account without password exists', () => {
    const existingWithoutPassword = {
      serverId: Cypress.env('MAILOSAUR_SERVER_ID'),
      serverDomain: Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
      email:
        'registrationEmailSentPage@' +
        Cypress.env('MAILOSAUR_SERVER_ID') +
        '.mailosaur.net',
    };

    it('from the set passsword link expired page, successfully send and reset the create password email, and get taken to the set password page from the email', () => {
      cy.visit('/set-password/expired');

      // link expired
      const timeRequestWasMadeLinkExpired = new Date();
      cy.get('input[name=email]').type(existingWithoutPassword.email);
      cy.get('[data-cy="main-form-submit-button"]').click();
      cy.contains('Check your email inbox');
      cy.contains(existingWithoutPassword.email);
      cy.contains('Resend email');
      cy.contains('Change email address');
      cy.mailosaurGetMessage(
        existingWithoutPassword.serverId,
        {
          sentTo: existingWithoutPassword.email,
        },
        {
          receivedAfter: timeRequestWasMadeLinkExpired,
        },
      ).then((email) => {
        cy.getEmailDetails(email).then(({ body, id }) => {
          expect(body).to.have.string('Welcome back');
          expect(body).to.have.string(
            'Please click below to create a password for your account.',
          );
          expect(body).to.have.string(
            'This link is only valid for 30 minutes.',
          );
          expect(body).to.have.string('Create password');
          cy.mailosaurDeleteMessage(id);
        });
      });

      // resend email
      const timeRequestWasMadeResend = new Date();
      cy.contains('Resend email').click();
      cy.contains('Check your email inbox');
      cy.contains(existingWithoutPassword.email);
      cy.mailosaurGetMessage(
        existingWithoutPassword.serverId,
        {
          sentTo: existingWithoutPassword.email,
        },
        {
          receivedAfter: timeRequestWasMadeResend,
        },
      ).then((email) => {
        cy.getEmailDetails(email, /\/set-password\/([^"]*)/).then(
          ({ body, id, links, token }) => {
            expect(body).to.have.string('Welcome back');
            expect(body).to.have.string(
              'Please click below to create a password for your account.',
            );
            expect(body).to.have.string(
              'This link is only valid for 30 minutes.',
            );
            expect(body).to.have.string('Create password');

            expect(links.length).to.eq(2);

            const createPasswordLink = links.find(
              (link) => link.text === 'Create password',
            );

            expect(createPasswordLink).not.to.be.undefined;

            cy.visit(`/set-password/${token}`);
            cy.contains('Create password');

            cy.mailosaurDeleteMessage(id);
          },
        );
      });
    });
  });
});
