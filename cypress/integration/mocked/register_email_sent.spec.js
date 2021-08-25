/* eslint-disable @typescript-eslint/no-var-requires */
/// <reference types="cypress" />
import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Registration email sent page', () => {
  const checkTokenSuccessResponse = {
    user: {
      primaryEmailAddress: 'test@example.com',
    },
  };

  const testUserEncryptedEmailCookie =
    'InRlc3QrMTM0MTFAZ3VhcmRpYW4uY29tIg%3D%3D';

  context('A11y checks', () => {
    it('has no detectable a11y violations on the registration email sent page', () => {
      cy.setEncryptedEmailCookie(testUserEncryptedEmailCookie);
      cy.mockNext(200, checkTokenSuccessResponse);
      cy.visit(`/register/email-sent`);
      injectAndCheckAxe();
    });
  });
});
