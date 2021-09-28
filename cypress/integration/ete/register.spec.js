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

  it('successfully registers using an email with no existing account', () => {
    cy.visit('/register');
    const timeRequestWasMade = new Date();
    cy.get('input[name=email').type(unregisteredAccount.email);
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
      // Extract the welcome token, so we can redirect to the welcome flow.
      const match = body.match(/theguardian.com\/welcome\/([^"]*)/);
      const token = match[1];
      cy.visit(`/welcome/${token}`);
      cy.contains('Create password');
      cy.mailosaurDeleteMessage(email.id);
    });
  });

  it('returns an error when email is in use and report error link redirects to support', () => {
    cy.visit('/register');
    cy.get('input[name=email').type(existing.email);
    cy.get('[data-cy="register-button"]').click();

    cy.contains('There was a problem registering, please try again');
    cy.contains('Report this error').click();
    cy.url().should(
      'eq',
      'https://manage.theguardian.com/help-centre/contact-us',
    );
  });

  it.only('errors on the client side when the user is offline and attempts to register and allows submission when back online', () => {
    cy.visit('/register');

    cy.network({ offline: true });

    cy.get('input[name=email').type(existing.email);
    cy.get('[data-cy="register-button"]').click();
    cy.contains(
      'There was a problem with the captcha process. You may find disabling your browser plugins, ensuring JavaScript is enabled or updating your browser will resolve this issue.',
    );

    cy.network({ offline: false });
    cy.contains(
      'There was a problem with the captcha process. You may find disabling your browser plugins, ensuring JavaScript is enabled or updating your browser will resolve this issue.',
    ).should('not.exist');

    cy.get('[data-cy="register-button"]').click();
    cy.contains('There was a problem registering, please try again');
  });
});
