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
  /**
   * TODO: Once the new Terms component is merged, remove the skip on these tests.
   */
  context.skip('Terms and Conditions links', () => {
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
});
