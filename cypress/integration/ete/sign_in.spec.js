/// <reference types='cypress' />
// This test depends on this Mailosaur account already being registered
const existing = {
  serverId: Cypress.env('MAILOSAUR_SERVER_ID'),
  serverDomain: Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
  email: 'signIn@' + Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
  password: 'existing_password',
};
describe('Sign in flow', () => {
  // We specify the CAPI json version of the article to reduce page load time waiting for ads.
  // This change was added because our test was timing out occasionally.
  const returnUrl =
    'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance.json';
  const defaultReturnUrl = 'https://m.code.dev-theguardian.com';
  it('links to the correct places', () => {
    cy.visit('/signin');
    cy.contains('terms of service').should(
      'have.attr',
      'href',
      'https://policies.google.com/terms',
    );
    cy.contains('Google privacy policy')
      .children()
      .should('have.attr', 'href', 'https://policies.google.com/privacy');
    cy.contains('terms & conditions').click();
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
    cy.url().should('include', 'https://m.code.dev-theguardian.com/');
  });

  it('navigates to reset password', () => {
    cy.visit('/signin');
    cy.contains('Reset password').click();
    cy.contains('Forgotten password');
  });

  it('navigates to registration', () => {
    cy.visit('/signin');
    cy.contains('Register').click();
    cy.get('[data-cy="register-button"]').should('be.visible');
  });

  it('respects the returnUrl query param', () => {
    cy.visit(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
    cy.get('input[name=email]').type(existing.email);
    cy.get('input[name=password]').type(existing.password);
    cy.get('[data-cy="sign-in-button"]').click();
    cy.url().should('eq', returnUrl);
  });

  // This functionality is still todo. Remove `skip` from this test once the returnUrl parameter is passed through
  it.skip('redirects correctly for social sign in', () => {
    cy.visit(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
    cy.get('[data-cy="google-sign-in-button"]').should(
      'have.attr',
      'href',
      `https://oauth.theguardian.com/google/signin?returnUrl=${encodeURIComponent(
        returnUrl,
      )}`,
    );
    cy.get('[data-cy="facebook-sign-in-button"]').should(
      'have.attr',
      'href',
      `https://oauth.theguardian.com/facebook/signin?returnUrl=${encodeURIComponent(
        returnUrl,
      )}`,
    );
    cy.get('[data-cy="apple-sign-in-button"]').should(
      'have.attr',
      'href',
      `https://oauth.theguardian.com/apple/signin?returnUrl=${encodeURIComponent(
        returnUrl,
      )}`,
    );
  });
  it('removes encryptedEmail parameter from query string', () => {
    cy.visit(`/signin?encryptedEmail=bhvlabgflbgyil`);
    cy.location('search').should(
      'eq',
      `?returnUrl=${encodeURIComponent(defaultReturnUrl)}`,
    );
  });
  it('removes encryptedEmail parameter and preserves all other valid parameters', () => {
    cy.visit(
      `/signin?returnUrl=${encodeURIComponent(
        returnUrl,
      )}&encryptedEmail=bdfalrbagbgu&refViewId=12345`,
    );
    cy.location('search').should(
      'eq',
      `?refViewId=12345&returnUrl=${encodeURIComponent(returnUrl)}`,
    );
  });
  it('shows an error message and information paragraph when accountLinkingRequired error parameter is present', () => {
    cy.visit(`/signin?error=accountLinkingRequired`);
    cy.contains(
      'You cannot sign in with your social account because you already have an account with the Guardian.',
    );
    cy.get('[class*=ErrorSummary]').contains('Account already exists');
  });
});
