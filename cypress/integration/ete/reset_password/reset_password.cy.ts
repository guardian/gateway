import { randomPassword } from '../../../support/commands/testUser';

describe('Password reset flow', () => {
  context('Account exists', () => {
    it("changes the reader's password", () => {
      cy.intercept({
        method: 'GET',
        url: 'https://api.pwnedpasswords.com/range/*',
      }).as('breachCheck');

      cy.createTestUser({
        isUserEmailValidated: true,
      })?.then(({ emailAddress }) => {
        cy.visit('/signin');
        const timeRequestWasMade = new Date();
        cy.contains('Reset password').click();

        // Simulate going offline by failing the reCAPTCHA POST request.
        cy.intercept({
          method: 'POST',
          url: 'https://www.google.com/recaptcha/api2/**',
          times: 1,
        });

        cy.contains('Forgot password');
        cy.get('input[name=email]').type(emailAddress);

        // Check that both reCAPTCHA errors are shown.
        cy.get('[data-cy="main-form-submit-button"]').click();
        cy.contains('Google reCAPTCHA verification failed. Please try again.');
        cy.get('[data-cy="main-form-submit-button"]').click();
        cy.contains('Google reCAPTCHA verification failed.');
        cy.contains('If the problem persists please try the following:');
        cy.contains('userhelp@');

        // Continue checking the password reset flow after reCAPTCHA assertions above.
        cy.get('[data-cy="main-form-submit-button"]').click();
        cy.contains('Check your email inbox');
        cy.checkForEmailAndGetDetails(
          emailAddress,
          timeRequestWasMade,
          /reset-password\/([^"]*)/,
        ).then(({ token }) => {
          cy.visit(`/reset-password/${token}`);
          cy.get('input[name=password]').type(randomPassword());
          cy.wait('@breachCheck');
          cy.get('[data-cy="main-form-submit-button"]')
            .click()
            .should('be.disabled');
          cy.contains('Password updated');
          cy.contains(emailAddress.toLowerCase());
        });
      });
    });
  });

  context('Account without password exists', () => {
    it('changes the users password', () => {
      cy.intercept({
        method: 'GET',
        url: 'https://api.pwnedpasswords.com/range/*',
      }).as('breachCheck');

      cy.createTestUser({
        isUserEmailValidated: true,
      })?.then(({ emailAddress }) => {
        cy.visit('/signin');
        const timeRequestWasMade = new Date();
        cy.contains('Reset password').click();

        // Simulate going offline by failing the reCAPTCHA POST request.
        cy.intercept({
          method: 'POST',
          url: 'https://www.google.com/recaptcha/api2/**',
          times: 1,
        });

        cy.contains('Forgot password');
        cy.get('input[name=email]').type(emailAddress);

        // Check that both reCAPTCHA errors are shown.
        cy.get('[data-cy="main-form-submit-button"]').click();
        cy.contains('Google reCAPTCHA verification failed. Please try again.');
        cy.get('[data-cy="main-form-submit-button"]').click();
        cy.contains('Google reCAPTCHA verification failed.');
        cy.contains('If the problem persists please try the following:');
        cy.contains('userhelp@');

        // Continue checking the password reset flow after reCAPTCHA assertions above.
        cy.get('[data-cy="main-form-submit-button"]').click();
        cy.contains('Check your email inbox');
        cy.checkForEmailAndGetDetails(
          emailAddress,
          timeRequestWasMade,
          /reset-password\/([^"]*)/,
        ).then(({ token }) => {
          cy.visit(`/reset-password/${token}`);
          cy.get('input[name=password]').type(randomPassword());
          cy.wait('@breachCheck');
          cy.get('[data-cy="main-form-submit-button"]').click();
          cy.contains('Password updated');
          cy.contains(emailAddress.toLowerCase());
        });
      });
    });
  });

  context('No Account', () => {
    it('shows the email sent page with link to register when attempting to reset password', () => {
      cy.visit('/reset-password');
      cy.contains('Forgot password');
      cy.get('input[name=email]').type('invalid@doesnotexist.com');
      cy.get('[data-cy="main-form-submit-button"]').click();
      cy.contains('Check your email inbox');
      cy.contains('Register for free');
    });
  });
});

describe('Password set flow', () => {
  context('Account without password exists', () => {
    it('from the set passsword link expired page, successfully send and reset the create password email, and get taken to the set password page from the email', () => {
      cy.createTestUser({
        isUserEmailValidated: false,
        isGuestUser: true,
      })?.then(({ emailAddress }) => {
        cy.visit('/set-password/expired');

        // Simulate going offline by failing the reCAPTCHA POST request.
        cy.intercept({
          method: 'POST',
          url: 'https://www.google.com/recaptcha/api2/**',
          times: 1,
        });

        // link expired
        const timeRequestWasMadeLinkExpired = new Date();
        cy.get('input[name=email]').type(emailAddress);

        // Check that both reCAPTCHA errors are shown.
        cy.contains('Send me a link').click();
        cy.contains('Google reCAPTCHA verification failed. Please try again.');

        cy.contains('Send me a link').click();
        cy.contains('Google reCAPTCHA verification failed.');
        cy.contains('If the problem persists please try the following:');
        cy.contains('userhelp@');

        // Continue checking the password reset flow after reCAPTCHA assertions above.
        cy.contains('Send me a link').click();
        cy.contains('Check your email inbox');
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
        cy.contains('Check your email inbox');
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
