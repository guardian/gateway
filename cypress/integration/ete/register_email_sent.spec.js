/* eslint-disable @typescript-eslint/no-var-requires */
/// <reference types="cypress" />
import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Registration email sent page', () => {
  const testUserEmail = 'test+13411@guardian.com';
  const testUserEncryptedEmail = Buffer.from(
    JSON.stringify(testUserEmail),
  ).toString('base64');

  context('A11y checks', () => {
    it('has no detectable a11y violations on the registration email sent page', () => {
      cy.setCookie('PLAY_SESSION_2', testUserEncsryptedEmail, {
        log: true,
      });
      cy.visit(`/register/email-sent`);
      injectAndCheckAxe();
    });
  });

  it('should load the page with a success banner given a valid encrypted email cookie', () => {
    cy.setCookie('PLAY_SESSION_2', testUserEncryptedEmail, {
      log: true,
    });
    cy.visit(`/register/email-sent`);
    cy.contains('Email sent');
    cy.contains(testUserEmail);
    cy.contains('Resend email');
    cy.contains('Change email address');
  });

  // Depends on a Guest account already created using this email.
  it('should resend the email when the resend button is clicked', () => {
    const resendTestEmail = {
      email: '7b4f97c5-79cd-4a3c-9212-cfb6db959dfc@mailslurp.com',
      inbox: '7b4f97c5-79cd-4a3c-9212-cfb6db959dfc',
    };
    const testMailslurpEncryptedEmail = Buffer.from(
      JSON.stringify(resendTestEmail.email),
    ).toString('base64');

    cy.emptyInbox(resendTestEmail.inbox).then(() => {
      cy.setCookie('PLAY_SESSION_2', testMailslurpEncryptedEmail, {
        log: true,
      });
      cy.visit(`/register/email-sent`);
      cy.contains(resendTestEmail.email);
      cy.contains('Resend email').click();
      cy.waitForLatestEmail(resendTestEmail.inbox).then((email) => {
        expect(email.body).to.contain('Complete registration');
        // Extract the welcome token, so we can redirect to the welcome flow.
        const match = email.body.match(/theguardian.com\/welcome\/([^"]*)/);
        const token = match[1];
        cy.visit(`/welcome/${token}`);
        cy.contains('7b4f97c5-79cd-4a3c-9212-cfb6db959dfc@mailslurp.com');
      });
    });
  });

  it('should navigate back to the correct page when change email is clicked', () => {
    cy.setCookie('PLAY_SESSION_2', testUserEncryptedEmail, {
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
