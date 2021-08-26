/* eslint-disable @typescript-eslint/no-var-requires */
/// <reference types="cypress" />
import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Registration email sent page', () => {
  const testUserEncryptedEmailCookie =
    'InRlc3QrMTM0MTFAZ3VhcmRpYW4uY29tIg%3D%3D';

  context('A11y checks', () => {
    it('has no detectable a11y violations on the registration email sent page', () => {
      // set encrypted email
      cy.setCookie('GU_email', testUserEncryptedEmailCookie, {
        log: true,
      });
      cy.visit(`/register/email-sent`);
      injectAndCheckAxe();
    });
  });

  it('should load the page with a success banner given a valid encrypted email cookie', () => {
    // set encrypted email
    cy.setCookie('GU_email', testUserEncryptedEmailCookie, {
      log: true,
    });
    cy.visit(`/register/email-sent`);
    cy.contains('Email sent');
    cy.contains('test+13411@guardian.com');
    cy.contains('Resend email');
    cy.contains('Change email address');
  });

  // This test depends on this Mailslurp account already being registered
  const resendTestEmail = {
    email: '7b4f97c5-79cd-4a3c-9212-cfb6db959dfc@mailslurp.com',
    inbox: '7b4f97c5-79cd-4a3c-9212-cfb6db959dfc',
  };
  // Set encrypted email using test email defined above.
  const testMailSlurpEncryptedEmailCookie = Buffer.from(
    JSON.stringify(resendTestEmail.email),
  ).toString('base64');

  it('should resend the email when the resend button is clicked', () => {
    cy.emptyInbox(resendTestEmail.inbox).then(() => {
      cy.setCookie('GU_email', testMailSlurpEncryptedEmailCookie, {
        log: true,
      });
      cy.visit(`/register/email-sent`);
      cy.contains(resendTestEmail.email);
      cy.contains('Resend email').click();
      cy.waitForLatestEmail(resendTestEmail.inbox).then((email) => {
        expect(email.body).to.contain('Complete registration');
        // extract the reset token (so we can reset this reader's password)
        const match = email.body.match(/theguardian.com\/welcome\/([^"]*)/);
        const token = match[1];
        cy.visit(`/welcome/${token}`);
        cy.contains('7b4f97c5-79cd-4a3c-9212-cfb6db959dfc@mailslurp.com');
      });
    });
  });

  it('should navigate back to the correct page when change email is clicked', () => {});

  it('should render properly if the encrypted email cookie is not set', () => {});

  // mock errors for when resend email CTA fails.
});
