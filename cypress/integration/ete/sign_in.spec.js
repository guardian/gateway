/// <reference types='cypress' />
// This test depends on this Mailosaur account already being registered
import { getConfiguration } from '@/server/lib/getConfiguration';

const existing = {
  serverId: Cypress.env('MAILOSAUR_SERVER_ID'),
  serverDomain: Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
  email: 'signIn@' + Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
  password: 'existing_password',
};
describe('Sign in flow', () => {
  const { oauthBaseUrl } = getConfiguration();
  const returnUrl =
    'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';

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

  it.skip('redirects correctly for social sign in', () => {
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
  it('should remove encryptedEmail parameter', () => {
    cy.visit(
      `/signin?returnUrl=${encodeURIComponent(
        returnUrl,
      )}&encryptedEmail=bhjlfvbdyvlbfryuvl&refId=1234`,
    );
    cy.location('pathname').should('eq', `/signin`);
    cy.location('search').should(
      'eq',
      `?returnUrl=${encodeURIComponent(returnUrl)}&refId=1234`,
    );
  });
  it('should show additional information when accountLinkingRequired error is present', () => {
    cy.visit(
      `/signin?returnUrl=${encodeURIComponent(
        returnUrl,
      )}&error=accountLinkingRequired`,
    );
    cy.contains(
      'You cannot sign in with your social account because you already have an account with the Guardian.',
    );
  });
});
