describe('Send password reset email in Okta', () => {
  const email = 'mrtest@theguardian.com';

  beforeEach(() => {
    cy.mockPurge();
    cy.mockRecaptcha();
  });

  context('send reset password email', () => {
    it('shows email sent page when successful', () => {
      cy.visit('/reset-password?useOkta=true');
      cy.get('input[name="email"]').type(email);
      cy.mockNext(200, {
        status: 'RECOVERY_CHALLENGE',
        factorResult: 'WAITING',
        factorType: 'EMAIL',
        recoveryType: 'PASSWORD',
      });
      cy.get('button[type="submit"]').click();
      cy.contains('Check your email inbox');
    });

    it('shows a generic error when something goes wrong', () => {
      cy.visit('/reset-password?useOkta=true');
      cy.get('input[name="email"]').type(email);
      cy.mockNext(403, {
        errorCode: 'E0000006',
        errorSummary:
          'You do not have permission to perform the requested action',
        errorLink: 'E0000006',
        errorId: 'errorId',
        errorCauses: [],
      });
      cy.get('button[type="submit"]').click();
      cy.contains('Sorry, something went wrong. Please try again.');
    });
  });
});
