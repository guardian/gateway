import { UserResponse } from '../../../src/server/models/okta/User';

describe('Send password reset email in Okta', () => {
  const email = 'mrtest@theguardian.com';

  const mockUserActiveWithPassword: UserResponse = {
    id: 'test',
    status: 'ACTIVE',
    profile: {
      login: 'mrtest@theguardian.com',
      email: 'mrtest@theguardian.com',
    },
    credentials: {
      password: {},
      provider: {
        type: 'OKTA',
        name: 'OKTA',
      },
    },
  };

  const mockUserActiveWithoutPassword: UserResponse = {
    id: 'test',
    status: 'ACTIVE',
    profile: {
      login: 'mrtest@theguardian.com',
      email: 'mrtest@theguardian.com',
    },
    credentials: {
      provider: {
        type: 'OKTA',
        name: 'OKTA',
      },
    },
  };

  const mockUserStaged: UserResponse = {
    id: 'test',
    status: 'STAGED',
    profile: {
      login: 'mrtest@theguardian.com',
      email: 'mrtest@theguardian.com',
    },
    credentials: {
      provider: {
        type: 'OKTA',
        name: 'OKTA',
      },
    },
  };

  const mockUserProvisioned: UserResponse = {
    id: 'test',
    status: 'PROVISIONED',
    profile: {
      login: 'mrtest@theguardian.com',
      email: 'mrtest@theguardian.com',
    },
    credentials: {
      provider: {
        type: 'OKTA',
        name: 'OKTA',
      },
    },
  };

  const mockUserRecovery: UserResponse = {
    id: 'test',
    status: 'RECOVERY',
    profile: {
      login: 'mrtest@theguardian.com',
      email: 'mrtest@theguardian.com',
    },
    credentials: {
      provider: {
        type: 'OKTA',
        name: 'OKTA',
      },
    },
  };

  const mockUserPasswordExpired: UserResponse = {
    id: 'test',
    status: 'PASSWORD_EXPIRED',
    profile: {
      login: 'mrtest@theguardian.com',
      email: 'mrtest@theguardian.com',
    },
    credentials: {
      provider: {
        type: 'OKTA',
        name: 'OKTA',
      },
    },
  };

  beforeEach(() => {
    cy.mockPurge();
  });

  context('send reset password email for ACTIVE user', () => {
    it('shows email sent page when successful', () => {
      cy.visit('/reset-password?useOkta=true');
      cy.get('input[name="email"]').type(email);
      cy.mockNext(200, mockUserActiveWithPassword);
      cy.mockNext(200, {
        status: 'RECOVERY_CHALLENGE',
        factorResult: 'WAITING',
        factorType: 'EMAIL',
        recoveryType: 'PASSWORD',
      });
      cy.get('button[type="submit"]').click();
      cy.contains('Check your email inbox');
    });
  });

  context('send reset password email for ACTIVE user without password', () => {
    it('shows email sent page when successful', () => {
      cy.visit('/reset-password?useOkta=true');
      cy.get('input[name="email"]').type(email);
      cy.mockNext(200, mockUserActiveWithoutPassword);
      cy.mockNext(403, {
        errorCode: 'E0000006',
        errorSummary:
          'You do not have permission to perform the requested action',
        errorLink: 'E0000006',
        errorId: 'errorId',
        errorCauses: [],
      });
      cy.mockNext(200, {
        resetPasswordUrl: `https://${Cypress.env(
          'BASE_URI',
        )}/reset_password/token_token_token_to`,
      });
      cy.mockNext(200, {
        stateToken: 'stateToken',
        expiresAt: new Date(Date.now() + 1800000 /* 30min */),
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
      cy.mockNext(200, {
        expiresAt: new Date(Date.now() + 1800000 /* 30min */),
        status: 'SUCCESS',
        sessionToken: 'aValidSessionToken',
        _embedded: {
          user: {
            id: '12345',
            passwordChanged: new Date().toISOString(),
            profile: {
              login: email,
              firstName: null,
              lastName: null,
              locale: 'en_US',
              timeZone: 'America/Los_Angeles',
            },
          },
        },
      });
      cy.mockNext(200, mockUserActiveWithoutPassword);
      cy.mockNext(200, {
        status: 'RECOVERY_CHALLENGE',
        factorResult: 'WAITING',
        factorType: 'EMAIL',
        recoveryType: 'PASSWORD',
      });
      cy.get('button[type="submit"]').click();
      cy.contains('Check your email inbox');
    });
  });

  context('send create password email for STAGED user', () => {
    it('shows email sent page when successful', () => {
      cy.visit('/reset-password?useOkta=true');
      cy.get('input[name="email"]').type(email);
      cy.mockNext(200, mockUserStaged);
      cy.mockNext(200, {
        activationToken: `token_token_token_to`,
      });
      cy.get('button[type="submit"]').click();
      cy.contains('Check your email inbox');
    });
  });

  context('send create password email for PROVISIONED user', () => {
    it('shows email sent page when successful', () => {
      cy.visit('/reset-password?useOkta=true');
      cy.get('input[name="email"]').type(email);
      cy.mockNext(200, mockUserProvisioned);
      cy.mockNext(200, {
        activationToken: `token_token_token_to`,
      });
      cy.get('button[type="submit"]').click();
      cy.contains('Check your email inbox');
    });
  });

  context('send reset password email for RECOVERY user', () => {
    it('shows email sent page when successful', () => {
      cy.visit('/reset-password?useOkta=true');
      cy.get('input[name="email"]').type(email);
      cy.mockNext(200, mockUserRecovery);
      cy.mockNext(200, {
        resetPasswordUrl: `https://${Cypress.env(
          'BASE_URI',
        )}/reset_password/token_token_token_to`,
      });
      cy.get('button[type="submit"]').click();
      cy.contains('Check your email inbox');
    });
  });

  context('send reset password email for PASSWORD_EXPIRED user', () => {
    it('shows email sent page when successful', () => {
      cy.visit('/reset-password?useOkta=true');
      cy.get('input[name="email"]').type(email);
      cy.mockNext(200, mockUserPasswordExpired);
      cy.mockNext(200, {
        resetPasswordUrl: `https://${Cypress.env(
          'BASE_URI',
        )}/reset_password/token_token_token_to`,
      });
      cy.get('button[type="submit"]').click();
      cy.contains('Check your email inbox');
    });
  });

  context('generic error handling', () => {
    it('shows a generic error when something goes wrong', () => {
      cy.visit('/reset-password?useOkta=true');
      cy.get('input[name="email"]').type(email);
      cy.mockNext(200, mockUserActiveWithPassword);
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
