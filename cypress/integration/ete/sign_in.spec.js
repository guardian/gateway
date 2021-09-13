/// <reference types='cypress' />
// This test depends on this Mailosaur account already being registered
const existing = {
  serverId: Cypress.env('MAILOSAUR_SERVER_ID'),
  get serverDomain() {
    return `${this.serverId}.mailosaur.net`;
  },
  get email() {
    return `signIn@${this.serverDomain}`;
  },
  password: 'existing_password',
};
describe('Sign in flow', () => {
  it('links to the correct places', () => {
    cy.visit('/signin');
    cy.contains('Terms of Service').should(
      'have.attr',
      'href',
      'https://policies.google.com/terms',
    );
    cy.contains("Google's Privacy Policy").should(
      'have.attr',
      'href',
      'https://policies.google.com/privacy',
    );
    cy.contains('Terms and Conditions').click();
    cy.contains('Terms and conditions of use');
  });

  it('shows a message when credentials are invalid', () => {
    cy.visit('/signin');
    cy.get('input[name=email]').type('invalid@doesnotexist.com');
    cy.get('input[name=password]').type('password');
    cy.get('[data-cy="sign-in-button"]').click();
    cy.contains('This email and password combination is not valid');
  });

  it('correctly signs in an existing user', () => {
    cy.visit('/signin');
    cy.get('input[name=email]').type(existing.email);
    cy.get('input[name=password]').type(existing.password);
    cy.get('[data-cy="sign-in-button"]').click();
    cy.contains('News');
  });

  it('navigates to reset password', () => {
    cy.visit('/signin');
    cy.contains('Reset password').click();
    cy.contains('Forgotten password');
  });

  it('navigates to magic link', () => {
    cy.visit('/signin');
    cy.contains('email me a link').click();
    cy.contains('Link to sign in');
  });

  it('navigates to registration', () => {
    cy.visit('/signin');
    cy.contains('Register').click();
    cy.get('[data-cy="register-button"]').should('be.visible');
  });

  it('respects the returnUrl query param', () => {
    cy.visit(
      `/signin?returnUrl=${encodeURIComponent(
        `https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance`,
      )}`,
    );
    cy.get('input[name=email]').type(existing.email);
    cy.get('input[name=password]').type(existing.password);
    cy.get('[data-cy="sign-in-button"]').click();
    cy.contains(
      'individual responsible for one of the most significant leaks in US political history is Edward Snowden',
    );
  });

  // This functionality is still todo. Remove `skip` from this test once the returnUrl parameter is passed through
  it.skip('redirects correctly for social sign in', () => {
    cy.visit(
      `/signin?returnUrl=${encodeURIComponent(
        `https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance`,
      )}`,
    );
    cy.get('[data-cy="google-sign-in-button"]').should(
      'have.attr',
      'href',
      `https://oauth.theguardian.com/google/signin?returnUrl=${encodeURIComponent(
        `https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance`,
      )}`,
    );
    cy.get('[data-cy="facebook-sign-in-button"]').should(
      'have.attr',
      'href',
      `https://oauth.theguardian.com/facebook/signin?returnUrl=${encodeURIComponent(
        `https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance`,
      )}`,
    );
    cy.get('[data-cy="apple-sign-in-button"]').should(
      'have.attr',
      'href',
      `https://oauth.theguardian.com/apple/signin?returnUrl=${encodeURIComponent(
        `https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance`,
      )}`,
    );
  });
});
