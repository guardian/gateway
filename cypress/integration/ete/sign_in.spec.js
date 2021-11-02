/// <reference types='cypress' />
// This test depends on this Mailosaur account already being registered
const existing = {
  serverId: Cypress.env('MAILOSAUR_SERVER_ID'),
  serverDomain: Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
  email: 'signIn@' + Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
  password: 'existing_password',
};
const oauthBaseUrl = 'https://oauth.code.dev-theguardian.com';
describe('Sign in flow', () => {
  const returnUrl =
    'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';
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
  it('applies form validation to email and password input fields', () => {
    cy.visit('/signin');

    cy.get('form').within(() => {
      cy.get('input:invalid').should('have.length', 2);
      cy.get('input[name=email]').type('not an email');
      cy.get('input:invalid').should('have.length', 2);
      cy.get('input[name=email]').type('emailaddress@inavalidformat.com');
      cy.get('input:invalid').should('have.length', 1);
      cy.get('input[name=password]').type('password');
      cy.get('input:invalid').should('have.length', 0);
    });
  });
  it('shows a message when credentials are invalid', () => {
    cy.visit('/signin');
    cy.get('input[name=email]').type('invalid@doesnotexist.com');
    cy.get('input[name=password]').type('password');
    cy.get('[data-cy="sign-in-button"]').click();
    cy.contains("Email and password don't match");
  });

  it('correctly signs in an existing user', () => {
    // Intercept the external redirect page.
    // We just want to check that the redirect happens, not that the page loads.
    cy.intercept('GET', 'https://m.code.dev-theguardian.com/', (req) => {
      req.reply(200);
    });

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
    // Intercept the external redirect page.
    // We just want to check that the redirect happens, not that the page loads.
    cy.intercept('GET', returnUrl, (req) => {
      req.reply(200);
    });
    cy.visit(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
    cy.get('input[name=email]').type(existing.email);
    cy.get('input[name=password]').type(existing.password);
    cy.get('[data-cy="sign-in-button"]').click();
    cy.url().should('eq', returnUrl);
  });

  it('redirects correctly for social sign in', () => {
    cy.visit(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
    cy.get('[data-cy="google-sign-in-button"]').should(
      'have.attr',
      'href',
      `${oauthBaseUrl}/google/signin?returnUrl=${encodeURIComponent(
        returnUrl,
      )}`,
    );
    cy.get('[data-cy="facebook-sign-in-button"]').should(
      'have.attr',
      'href',
      `${oauthBaseUrl}/facebook/signin?returnUrl=${encodeURIComponent(
        returnUrl,
      )}`,
    );
    cy.get('[data-cy="apple-sign-in-button"]').should(
      'have.attr',
      'href',
      `${oauthBaseUrl}/apple/signin?returnUrl=${encodeURIComponent(returnUrl)}`,
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
