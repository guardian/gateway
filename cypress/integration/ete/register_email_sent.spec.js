/* eslint-disable @typescript-eslint/no-var-requires */
/// <reference types="cypress" />
import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Registration email sent page', () => {
  const email = {
    value: '7b4f97c5-79cd-4a3c-9212-cfb6db959dfc@mailslurp.com',
    inbox: '7b4f97c5-79cd-4a3c-9212-cfb6db959dfc',
  };

  const encryptedEmail = Buffer.from(
    JSON.stringify(email.value),
  ).toString('base64');
  
  context('A11y checks', () => {
    it('has no detectable a11y violations on the registration email sent page', () => {
      cy.setCookie('PLAY_SESSION_2', encryptedEmail, {
        log: true,
      });
      cy.visit(`/register/email-sent`);
      injectAndCheckAxe();
    });
  });

  it('should load the page with a success banner given a valid encrypted email cookie', () => {
    cy.setCookie('PLAY_SESSION_2', encryptedEmail, {
      log: true,
    });
    cy.visit(`/register/email-sent`);
    cy.contains('Email sent');
    cy.contains(email.value);
    cy.contains('Resend email');
    cy.contains('Change email address');
  });

  // Depends on a Guest account already created using this email.
  it('should resend the email when the resend button is clicked', () => {
    cy.emptyInbox(resendTestEmail.inbox).then(() => {
      cy.setCookie('PLAY_SESSION_2', encryptedEmail, {
        log: true,
      });
      cy.visit(`/register/email-sent`);
      cy.contains(email.value);
      cy.contains('Resend email').click();
      cy.waitForLatestEmail(resendTestEmail.inbox).then((email) => {
        expect(email.body).to.contain('Complete registration');
        // Extract the welcome token, so we can redirect to the welcome flow.
        const match = email.body.match(/theguardian.com\/welcome\/([^"]*)/);
        const token = match[1];
        cy.visit(`/welcome/${token}`);
        cy.contains(email.value);
      });
    });
  });

  it('should navigate back to the correct page when change email is clicked', () => {
    cy.setCookie('PLAY_SESSION_2', encryptedEmail, {
      log: true,
    });
    cy.visit(`/register/email-sent`);
    cy.contains('Change email address').click();
    cy.contains('Sign in');
    cy.title().should('eq', 'Sign in | The Guardian');
  });

  it('should render properly if the encrypted email cookie is not set', () => {
    cy.visit(`/register/email-sent`);
    cy.contains('Change email address');
    cy.contains('Email sent');
  });
});
