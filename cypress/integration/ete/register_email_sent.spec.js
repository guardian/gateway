/* eslint-disable @typescript-eslint/no-var-requires */
/// <reference types="cypress" />
import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Registration email sent page', () => {
  const existing = {
    serverId: Cypress.env('MAILOSAUR_SERVER_ID'),
    serverDomain: Cypress.env('MAILOSAUR_SERVER_ID') + 'mailosaur.net',
    email:
      'registrationEmailSentPage@' +
      Cypress.env('MAILOSAUR_SERVER_ID') +
      'mailosaur.net',
  };

  // PLAY_SESSION_2 encrypted email is generated by identity-frontend when you start a guest registration.
  // If the test email changes, copy this cookie from the browser to the encryptedEmail variable.
  const encryptedEmail =
    'eyJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7ImVtYWlsIjoicmVnaXN0cmF0aW9uRW1haWxTZW50UGFnZUB5dGNwMG44cS5tYWlsb3NhdXIubmV0In0sImV4cCI6MTYzMTU0NjA1NCwibmJmIjoxNjMxNTQ0MjU0LCJpYXQiOjE2MzE1NDQyNTR9.2QqQA0adO31fNeiOQGih7DdgxPaJeWJhwFWBAzanDRQ';

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
    cy.contains(existing.email);
    cy.contains('Resend email');
    cy.contains('Change email address');
  });

  // Depends on a Guest account already created using this email.
  it('should resend the email when the resend button is clicked', () => {
    cy.setCookie('PLAY_SESSION_2', encryptedEmail, {
      log: true,
    });
    cy.visit(`/register/email-sent`);
    cy.contains(existing.email);
    const timeRequestWasMade = new Date();
    cy.contains('Resend email').click();
    cy.mailosaurGetMessage(
      existing.serverId,
      {
        sentTo: existing.email,
      },
      {
        receivedAfter: theTimeRequestIsSent,
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
