describe('POST requests return a user-facing error message when encountering a rate limit from Okta', () => {
  specify('Submit /signin', () => {
    cy.visit('/signin');
    cy.get('input[name="email"]').type('example@example.com');
    cy.get('input[name="password"]').type('password');

    cy.mockNext(429, {
      errorCode: 'E0000047',
      errorSummary: 'API call exceeded rate limit due to too many requests.',
      errorLink: 'E0000047',
      errorId: 'sampleXAy5B35EOzELmZL1zMy',
      errorCauses: [],
    });
    cy.get('button[type=submit]').click();
    cy.contains('There was a problem signing in, please try again.');
  });

  specify('Submit /reauthenticate', () => {
    cy.visit('/reauthenticate');
    cy.get('input[name="email"]').type('example@example.com');
    cy.get('input[name="password"]').type('password');

    cy.mockNext(429, {
      errorCode: 'E0000047',
      errorSummary: 'API call exceeded rate limit due to too many requests.',
      errorLink: 'E0000047',
      errorId: 'sampleXAy5B35EOzELmZL1zMy',
      errorCauses: [],
    });
    cy.get('button[type=submit]').click();
    cy.contains('There was a problem signing in, please try again.');
  });

  specify('Submit /register', () => {
    cy.visit('/register');
    cy.get('input[name="email"]').type('example@example.com');

    cy.mockNext(429, {
      errorCode: 'E0000047',
      errorSummary: 'API call exceeded rate limit due to too many requests.',
      errorLink: 'E0000047',
      errorId: 'sampleXAy5B35EOzELmZL1zMy',
      errorCauses: [],
    });
    cy.get('button[type=submit]').click();
    cy.contains('There was a problem registering, please try again.');
  });

  specify('Submit /reset-password', () => {
    cy.visit('/reset-password');
    cy.get('input[name="email"]').type('example@example.com');

    cy.mockNext(429, {
      errorCode: 'E0000047',
      errorSummary: 'API call exceeded rate limit due to too many requests.',
      errorLink: 'E0000047',
      errorId: 'sampleXAy5B35EOzELmZL1zMy',
      errorCauses: [],
    });
    cy.get('button[type=submit]').click();
    cy.contains('Sorry, something went wrong. Please try again.');
  });

  specify('Submit /welcome/resend', () => {
    cy.visit(`/welcome/resend`);
    cy.get('input[name="email"]').type('example@example.com');

    cy.mockNext(429, {
      errorCode: 'E0000047',
      errorSummary: 'API call exceeded rate limit due to too many requests.',
      errorLink: 'E0000047',
      errorId: 'sampleXAy5B35EOzELmZL1zMy',
      errorCauses: [],
    });
    cy.get('button[type=submit]').click();
    cy.contains('Sorry, something went wrong. Please try again.');
  });

  specify('Submit /welcome/expired', () => {
    cy.visit(`/welcome/expired`);
    cy.get('input[name="email"]').type('example@example.com');

    cy.mockNext(429, {
      errorCode: 'E0000047',
      errorSummary: 'API call exceeded rate limit due to too many requests.',
      errorLink: 'E0000047',
      errorId: 'sampleXAy5B35EOzELmZL1zMy',
      errorCauses: [],
    });
    cy.get('button[type=submit]').click();
    cy.contains('Sorry, something went wrong. Please try again.');
  });

  specify('Submit /reset-password/resend', () => {
    cy.visit(`/reset-password/resend`);
    cy.get('input[name="email"]').type('example@example.com');

    cy.mockNext(429, {
      errorCode: 'E0000047',
      errorSummary: 'API call exceeded rate limit due to too many requests.',
      errorLink: 'E0000047',
      errorId: 'sampleXAy5B35EOzELmZL1zMy',
      errorCauses: [],
    });
    cy.get('button[type=submit]').click();
    cy.contains('Sorry, something went wrong. Please try again.');
  });

  specify('Submit /reset-password/expired', () => {
    cy.visit(`/reset-password/expired`);
    cy.get('input[name="email"]').type('example@example.com');

    cy.mockNext(429, {
      errorCode: 'E0000047',
      errorSummary: 'API call exceeded rate limit due to too many requests.',
      errorLink: 'E0000047',
      errorId: 'sampleXAy5B35EOzELmZL1zMy',
      errorCauses: [],
    });
    cy.get('button[type=submit]').click();
    cy.contains('Sorry, something went wrong. Please try again.');
  });

  specify('Submit /set-password/resend', () => {
    cy.visit(`/set-password/resend`);
    cy.get('input[name="email"]').type('example@example.com');

    cy.mockNext(429, {
      errorCode: 'E0000047',
      errorSummary: 'API call exceeded rate limit due to too many requests.',
      errorLink: 'E0000047',
      errorId: 'sampleXAy5B35EOzELmZL1zMy',
      errorCauses: [],
    });
    cy.get('button[type=submit]').click();
    cy.contains('Sorry, something went wrong. Please try again.');
  });

  specify('Submit /set-password/expired', () => {
    cy.visit(`/set-password/expired`);
    cy.get('input[name="email"]').type('example@example.com');

    cy.mockNext(429, {
      errorCode: 'E0000047',
      errorSummary: 'API call exceeded rate limit due to too many requests.',
      errorLink: 'E0000047',
      errorId: 'sampleXAy5B35EOzELmZL1zMy',
      errorCauses: [],
    });
    cy.get('button[type=submit]').click();
    cy.contains('Sorry, something went wrong. Please try again.');
  });
});
