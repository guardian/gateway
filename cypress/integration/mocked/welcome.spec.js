import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Welcome and set password page', () => {
  const checkTokenSuccessResponse = {
    user: {
      primaryEmailAddress: 'test@example.com',
    },
  };

  beforeEach(() => {
    cy.mockPurge();
  });

  context('A11y checks', () => {
    it('has no detectable a11y violations on the set password page', () => {
      cy.mockNext(200, checkTokenSuccessResponse);
      cy.visit(`/welcome/fake_token`);
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on set password page with global error', () => {
      cy.mockNext(200, checkTokenSuccessResponse);
      cy.visit(`/welcome/fake_token`);
      cy.mockNext(500);
      cy.get('input[name="password"]').type('short');
      cy.get('button[type="submit"]').click();
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on the resend page', () => {
      cy.visit(`/welcome/resend`);
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on the resend page with global error', () => {
      cy.visit(`/welcome/resend`);

      cy.mockNext(500);
      cy.get('input[name="email"]').type(
        checkTokenSuccessResponse.user.primaryEmailAddress,
      );
      cy.get('button[type="submit"]').click();
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on the email sent page with resend box', () => {
      cy.visit(`/welcome/resend`);

      cy.mockNext(200);
      cy.get('input[name="email"]').type(
        checkTokenSuccessResponse.user.primaryEmailAddress,
      );
      cy.get('button[type="submit"]').click();
      injectAndCheckAxe();
    });

    it('has no detectable a11y violations on the email sent page without resend box', () => {
      cy.visit(`/welcome/email-sent`);
      injectAndCheckAxe();
    });
  });
});
