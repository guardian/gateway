describe('Password reset flow', () => {
  context('Account exists', () => {
    it("changes the reader's password", () => {
      cy.intercept({
        method: 'GET',
        url: 'https://api.pwnedpasswords.com/range/*',
      }).as('breachCheck');

      cy.createTestUser({
        isUserEmailValidated: true,
        password: 'test_user',
      })?.then(({ emailAddress }) => {
        cy.visit('/signin');
        const timeRequestWasMade = new Date();
        cy.contains('Reset password').click();
        cy.contains('Forgotten password');
        cy.get('input[name=email]').type(emailAddress);
        cy.get('[data-cy="reset-password-button"]').click();
        cy.contains('Check your email inbox');
        cy.checkForEmailAndGetDetails(
          emailAddress,
          timeRequestWasMade,
          /reset-password\/([^"]*)/,
        ).then(({ token }) => {
          cy.visit(`/reset-password/${token}`);
          cy.get('input[name=password]').type('0298a96c-1028!@#');
          cy.wait('@breachCheck');
          cy.get('[data-cy="change-password-button"]').click();
          cy.contains('Password updated');
          cy.contains(emailAddress.toLowerCase());
        });
      });
    });
  });
});

describe('Password set flow', () => {
  context('Account without password exists', () => {
    it('from the set passsword link expired page, successfully send and reset the create password email, and get taken to the set password page from the email', () => {
      cy.createTestUser({
        isUserEmailValidated: false,
      })?.then(({ emailAddress }) => {
        cy.visit('/set-password/expired');

        // link expired
        const timeRequestWasMadeLinkExpired = new Date();
        cy.get('input[name=email]').type(emailAddress);
        cy.get('[data-cy="reset-password-button"]').click();
        cy.contains('Email sent');
        cy.contains(emailAddress);
        cy.contains('Resend email');
        cy.contains('Change email address');
        cy.checkForEmailAndGetDetails(
          emailAddress,
          timeRequestWasMadeLinkExpired,
        ).then(({ body }) => {
          expect(body).to.have.string('Welcome back');
          expect(body).to.have.string(
            'Please click below to create a password for your account.',
          );
          expect(body).to.have.string(
            'This link is only valid for 30 minutes.',
          );
          expect(body).to.have.string('Create password');
        });

        // resend email
        const timeRequestWasMadeResend = new Date();
        cy.contains('Resend email').click();
        cy.contains('Email sent');
        cy.contains(emailAddress);
        cy.checkForEmailAndGetDetails(
          emailAddress,
          timeRequestWasMadeResend,
          /\/set-password\/([^"]*)/,
        ).then(({ body, links, token }) => {
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
        });
      });
    });
  });
});
