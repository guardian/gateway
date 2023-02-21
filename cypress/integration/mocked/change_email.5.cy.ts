import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Change email', () => {
  beforeEach(() => {
    cy.mockPurge();
  });

  context('a11y checks', () => {
    it('Has no detectable a11y violations on change email complete page', () => {
      cy.visit('/change-email/complete');
      injectAndCheckAxe();
    });

    it('Has no detectable a11y violations on change email error page', () => {
      cy.mockNext(500, {
        status: 'error',
        errors: [
          {
            message: 'Invalid token',
          },
        ],
      });
      cy.visit('/change-email/token');
      injectAndCheckAxe();
    });
  });

  context('change email flow', () => {
    it('should be able to change email', () => {
      cy.mockNext(200, {
        status: 'ok',
      });
      cy.visit('/change-email/token');
      cy.contains('Success! Your email address has been updated.');
    });

    it('should be able to handle a change email error', () => {
      cy.mockNext(500, {
        status: 'error',
        errors: [
          {
            message: 'Invalid token',
          },
        ],
      });
      cy.visit('/change-email/token');
      cy.contains(
        'The email change link you followed has expired or was invalid.',
      );
    });
  });
});
