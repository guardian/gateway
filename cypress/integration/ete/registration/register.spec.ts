import { randomMailosaurEmail } from '../../../support/commands/testUser';

describe('Registration flow', () => {
  context('Terms and Conditions links', () => {
    it('links to the Google terms of service page', () => {
      const googleTermsUrl = 'https://policies.google.com/terms';
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', googleTermsUrl, (req) => {
        req.reply(200);
      });
      cy.visit('/signin');
      cy.contains('terms of service').click();
      cy.url().should('eq', googleTermsUrl);
    });

    it('links to the Google privacy policy page', () => {
      const googlePrivacyPolicyUrl = 'https://policies.google.com/privacy';
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', googlePrivacyPolicyUrl, (req) => {
        req.reply(200);
      });
      cy.visit('/signin');
      cy.contains('This site is protected by reCAPTCHA and the Google')
        .contains('privacy policy')
        .click();
      cy.url().should('eq', googlePrivacyPolicyUrl);
    });

    it('links to the Guardian terms and conditions page', () => {
      const googleTermsOfServiceUrl =
        'https://www.theguardian.com/help/terms-of-service';
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', googleTermsOfServiceUrl, (req) => {
        req.reply(200);
      });
      cy.visit('/signin');
      cy.contains('terms & conditions').click();
      cy.url().should('eq', googleTermsOfServiceUrl);
    });

    it('links to the Guardian privacy policy page', () => {
      const guardianPrivacyPolicyUrl =
        'https://www.theguardian.com/help/privacy-policy';
      // Intercept the external redirect page.
      // We just want to check that the redirect happens, not that the page loads.
      cy.intercept('GET', guardianPrivacyPolicyUrl, (req) => {
        req.reply(200);
      });
      cy.visit('/signin');
      cy.contains('For information about how we use your data')
        .contains('privacy policy')
        .click();
      cy.url().should('eq', guardianPrivacyPolicyUrl);
    });
  });

  it('does not proceed when no email provided', () => {
    cy.visit('/register');
    cy.get('[data-cy="register-button"]').click();
    // check that form isn't submitted
    cy.url().should('not.contain', 'returnUrl');
    cy.contains('Please enter your email.');
  });

  it('does not proceed when invalid email provided', () => {
    cy.visit('/register');
    const invalidEmail = 'invalid.email.com';
    cy.get('input[name=email]').type(invalidEmail);
    cy.get('[data-cy="register-button"]').click();
    // check that form isn't submitted
    cy.url().should('not.contain', 'returnUrl');
    cy.contains('Please enter a valid email format.');
  });

  it('successfully registers using an email with no existing account', () => {
    const encodedReturnUrl =
      'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
    const decodedReturnUrl =
      'https://m.code.dev-theguardian.com/travel/2019/dec/18/food-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
    const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
    const decodedRef = 'https://m.theguardian.com/';
    const refViewId = 'testRefViewId';

    const unregisteredEmail = randomMailosaurEmail();

    cy.visit(
      '/register?returnUrl=' +
        encodedReturnUrl +
        '&ref=' +
        encodedRef +
        '&refViewId=' +
        refViewId,
    );
    const timeRequestWasMade = new Date();
    cy.get('input[name=email]').type(unregisteredEmail);
    cy.get('[data-cy="register-button"]').click();

    cy.contains('Email sent');
    cy.contains(unregisteredEmail);
    cy.contains('Resend email');
    cy.contains('Change email address');

    cy.checkForEmailAndGetDetails(
      unregisteredEmail,
      timeRequestWasMade,
      /welcome\/([^"]*)/,
    ).then(({ body, token }) => {
      expect(body).to.have.string('Complete registration');
      expect(body).to.have.string('returnUrl=' + decodedReturnUrl);
      expect(body).to.have.string('ref=' + decodedRef);
      expect(body).to.have.string('refViewId=' + refViewId);
      cy.visit(`/welcome/${token}`);
      cy.contains('Create password');
    });
  });

  it('sends user an account exists email for user with existing account with password trying to register, clicks sign in, taken to /signin', () => {
    cy.createTestUser({
      password: 'test_password',
      isUserEmailValidated: true,
    })?.then(({ emailAddress }) => {
      cy.visit('/register');
      const timeRequestWasMade = new Date();

      cy.get('input[name=email]').type(emailAddress);
      cy.get('[data-cy="register-button"]').click();

      cy.contains('Email sent');
      cy.contains(emailAddress);
      cy.contains('Resend email');
      cy.contains('Change email address');

      cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
        ({ links, body }) => {
          expect(body).to.have.string('This account already exists');
          expect(body).to.have.string('Sign in');
          expect(body).to.have.string('Reset password');

          expect(links.length).to.eq(3);

          const signInLink = links.find((link) => link.text === 'Sign in');

          expect(signInLink).not.to.be.undefined;
          expect(signInLink?.href ?? '').to.include('/signin');

          const signInUrl = new URL(signInLink?.href ?? '');

          cy.visit(signInUrl.pathname);
          cy.url().should('include', '/signin');
        },
      );
    });
  });

  it('sends user an account exists email for user with existing account with password trying to register, clicks reset password on email', () => {
    cy.createTestUser({
      password: 'test_password',
      isUserEmailValidated: true,
    })?.then(({ emailAddress }) => {
      cy.visit('/register');
      const timeRequestWasMade = new Date();

      cy.get('input[name=email]').type(emailAddress);
      cy.get('[data-cy="register-button"]').click();

      cy.contains('Email sent');
      cy.contains(emailAddress);
      cy.contains('Resend email');
      cy.contains('Change email address');

      cy.checkForEmailAndGetDetails(
        emailAddress,
        timeRequestWasMade,
        /\/reset-password\/([^"]*)/,
      ).then(({ links, body, token }) => {
        expect(body).to.have.string('This account already exists');
        expect(body).to.have.string('Sign in');
        expect(body).to.have.string('Reset password');
        expect(body).to.have.string('This link is only valid for 30 minutes.');

        expect(links.length).to.eq(3);

        const passwordResetLink = links.find(
          (link) => link.text === 'Reset password',
        );

        expect(passwordResetLink).not.to.be.undefined;

        cy.visit(`/reset-password/${token}`);
        cy.contains('Reset password');
      });
    });
  });

  it('sends user an account exists without password email for user with existing account without password trying to register, clicks create password on email', () => {
    cy.createTestUser({
      isUserEmailValidated: false,
    })?.then(({ emailAddress }) => {
      cy.visit('/register');
      const timeRequestWasMade = new Date();

      cy.get('input[name=email]').type(emailAddress);
      cy.get('[data-cy="register-button"]').click();

      cy.contains('Email sent');
      cy.contains(emailAddress);
      cy.contains('Resend email');
      cy.contains('Change email address');

      cy.checkForEmailAndGetDetails(
        emailAddress,
        timeRequestWasMade,
        /\/set-password\/([^"]*)/,
      ).then(({ links, body, token }) => {
        expect(body).to.have.string('This account already exists');
        expect(body).to.have.string(
          'To continue to your account please click below to create a password.',
        );
        expect(body).to.have.string('This link is only valid for 30 minutes.');
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

  it('errors when the user tries to register offline and allows registration when back online', () => {
    const unregisteredEmail = randomMailosaurEmail();

    cy.visit('/register');

    cy.network({ offline: true });

    cy.get('input[name=email').type(unregisteredEmail);
    cy.get('[data-cy="register-button"]').click();
    cy.contains('Google reCAPTCHA verification failed. Please try again.');

    // On second click, an expanded error is shown.
    cy.get('[data-cy="register-button"]').click();

    cy.contains('Google reCAPTCHA verification failed.');
    cy.contains('Report this error').should(
      'have.attr',
      'href',
      'https://manage.theguardian.com/help-centre/contact-us',
    );
    cy.contains('If the problem persists please try the following:');

    cy.network({ offline: false });
    const timeRequestWasMade = new Date();
    cy.get('[data-cy="register-button"]').click();
    cy.contains(
      'Google reCAPTCHA verification failed. Please try again.',
    ).should('not.exist');

    cy.contains('Email sent');
    cy.contains(unregisteredEmail);

    cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
      ({ body }) => {
        expect(body).to.have.string('Complete registration');
      },
    );
  });
});
