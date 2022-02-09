describe('Validate password token in Okta', () => {
  context.skip('show password form', () => {
    const email = 'mrtest@theguardian.com';
    const successResponse = (date: Date) => ({
      sessionToken: 'aValidSessionToken',
      expiresAt: date.toISOString(),
      status: 'SUCCESS',
      _embedded: {
        user: {
          id: '12345',
          passwordChanged: new Date().toISOString(),
          profile: {
            login: email,
            firstName: null,
            lastName: null,
          },
        },
      },
    });

    beforeEach(() => {
      cy.mockPurge();
    });

    it('displays the reset password page when the token is valid', () => {
      cy.mockNext(
        200,
        successResponse(new Date(Date.now() + 1000 * 60 * 30 /* 30min */)),
      );
      cy.visit(`/reset-password/valid_token?useOkta=true`);
      cy.contains('Reset password');
      cy.contains(`Please enter your new password for ${email}`);
    });

    it('shows the link expired page if the token is invalid', () => {
      cy.mockNext(403, {
        errorCode: 'E0000105',
        errorSummary:
          'You have accessed an account recovery link that has expired or been previously used.',
        errorLink: 'E0000105',
        errorId: 'errorId',
        errorCauses: [],
      });
      cy.visit(`/reset-password/fake_token?useOkta=true`);
      cy.contains('Link expired');
    });

    it('shows the session expired page if the token is expired', () => {
      cy.mockNext(200, successResponse(new Date(Date.now() - 1000)));
      cy.visit(`/reset-password/fake_token?useOkta=true`);
      cy.contains('Session timed out');
    });
  });
});
