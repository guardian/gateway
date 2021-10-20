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
};

// This test depends on this Mailosaur account already being registered
const existing = {
  serverId: Cypress.env('MAILOSAUR_SERVER_ID'),
  serverDomain: Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
  email: 'signIn@' + Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
};

describe('Registration flow', () => {
  context('Terms and Conditions links', () => {
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
      cy.url().should(
        'eq',
        'https://www.theguardian.com/help/terms-of-service',
      );
    });

    it('links to the Guardian privacy policy page', () => {
      cy.visit('/signin');
      cy.contains('For information about how we use your data')
        .contains('privacy policy')
        .click();
      cy.url().should('eq', 'https://www.theguardian.com/help/privacy-policy');
    });
  });

  it('does not proceed when no email provided', () => {
    cy.visit('/register');
    cy.get('[data-cy="register-button"]').click();
    // check that form isn't submitted
    cy.url().should('not.contain', 'returnUrl');
  });

  it('does not proceed when invalid email provided', () => {
    cy.visit('/register');
    const invalidEmail = 'invalid.email.com';
    cy.get('input[name=email]').type(invalidEmail);
    cy.get('[data-cy="register-button"]').click();
    // check that form isn't submitted
    cy.url().should('not.contain', 'returnUrl');
  });

  it('successfully registers using an email with no existing account', () => {
    const encodedReturnUrl =
      'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
    const decodedReturnUrl =
      'https://m.code.dev-theguardian.com/travel/2019/dec/18/food-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
    const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
    const decodedRef = 'https://m.theguardian.com/';
    const refViewId = 'testRefViewId';
    cy.visit(
      '/register?returnUrl=' +
        encodedReturnUrl +
        '&ref=' +
        encodedRef +
        '&refViewId=' +
        refViewId,
    );
    const timeRequestWasMade = new Date();
    cy.get('input[name=email]').type(unregisteredAccount.email);
    cy.get('[data-cy="register-button"]').click();

    cy.contains('Email sent');
    cy.contains(unregisteredAccount.email);
    cy.contains('Resend email');
    cy.contains('Change email address');

    cy.mailosaurGetMessage(
      unregisteredAccount.serverId,
      {
        sentTo: unregisteredAccount.email,
      },
      {
        receivedAfter: timeRequestWasMade,
      },
    ).then((email) => {
      const body = email.html.body;
      expect(body).to.have.string('Complete registration');
      expect(body).to.have.string('returnUrl=' + decodedReturnUrl);
      expect(body).to.have.string('ref=' + decodedRef);
      expect(body).to.have.string('refViewId=' + refViewId);
      // Extract the welcome token, so we can redirect to the welcome flow.
      const match = body.match(/theguardian.com\/welcome\/([^"]*)/);
      const token = match[1];
      cy.visit(`/welcome/${token}`);
      cy.contains('Create password');
      cy.mailosaurDeleteMessage(email.id);
    });
  });

  it('sends user an account exists email for user with existing account trying to register, clicks sign in, taken to /signin', () => {
    cy.visit('/register');
    const timeRequestWasMade = new Date();

    cy.get('input[name=email]').type(existing.email);
    cy.get('[data-cy="register-button"]').click();

    cy.contains('Email sent');
    cy.contains(existing.email);
    cy.contains('Resend email');
    cy.contains('Change email address');

    cy.mailosaurGetMessage(
      unregisteredAccount.serverId,
      {
        sentTo: existing.email,
      },
      {
        receivedAfter: timeRequestWasMade,
      },
    ).then((email) => {
      const body = email.html.body;

      const links = email.html.links ?? [];

      expect(body).to.have.string('This account already exists');
      expect(body).to.have.string('Sign in');
      expect(body).to.have.string('Reset password');

      expect(links.length).to.eq(3);

      const signInLink = links.find((link) => link.text === 'Sign in');

      expect(signInLink).not.to.be.undefined;
      expect(signInLink.href).to.include('/signin');

      const signInUrl = new URL(signInLink.href);

      cy.visit(signInUrl.pathname);
      cy.url().should('include', '/signin');

      cy.mailosaurDeleteMessage(email.id);
    });
  });

  it('sends user an account exists email for user with existing account trying to register, clicks reset password on email', () => {
    cy.visit('/register');
    const timeRequestWasMade = new Date();

    cy.get('input[name=email]').type(existing.email);
    cy.get('[data-cy="register-button"]').click();

    cy.contains('Email sent');
    cy.contains(existing.email);
    cy.contains('Resend email');
    cy.contains('Change email address');

    cy.mailosaurGetMessage(
      unregisteredAccount.serverId,
      {
        sentTo: existing.email,
      },
      {
        receivedAfter: timeRequestWasMade,
      },
    ).then((email) => {
      const body = email.html.body;

      const links = email.html.links ?? [];

      expect(body).to.have.string('This account already exists');
      expect(body).to.have.string('Sign in');
      expect(body).to.have.string('Reset password');

      expect(links.length).to.eq(3);

      const passwordResetLink = links.find(
        (link) => link.text === 'Reset password',
      );

      expect(passwordResetLink).not.to.be.undefined;

      const passwordResetUrl = new URL(passwordResetLink.href);

      // extract the reset token (so we can reset this reader's password)
      const match = passwordResetUrl.pathname.match(/\/c\/([^"]*)/);
      const token = match[1];

      cy.visit(`/reset-password/${token}`);
      cy.contains('Set Password');

      cy.mailosaurDeleteMessage(email.id);
    });
  });

  it('errors when the user tries to register offline and allows registration when back online', () => {
    cy.visit('/register');

    cy.network({ offline: true });

    cy.get('input[name=email').type(unregisteredAccount.email);
    cy.get('[data-cy="register-button"]').click();
    cy.contains(
      'There was a problem with the captcha process. You may find disabling your browser plugins, ensuring JavaScript is enabled or updating your browser will resolve this issue.',
    );

    cy.network({ offline: false });
    const timeRequestWasMade = new Date();
    cy.get('[data-cy="register-button"]').click();
    cy.contains(
      'There was a problem with the captcha process. You may find disabling your browser plugins, ensuring JavaScript is enabled or updating your browser will resolve this issue.',
    ).should('not.exist');

    cy.contains('Email sent');
    cy.contains(unregisteredAccount.email);

    cy.mailosaurGetMessage(
      unregisteredAccount.serverId,
      {
        sentTo: unregisteredAccount.email,
      },
      {
        receivedAfter: timeRequestWasMade,
      },
    ).then((email) => {
      cy.mailosaurDeleteMessage(email.id);
    });
  });
});
