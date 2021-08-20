/// <reference types='cypress' />

import { injectAndCheckAxe } from '../../support/cypress-axe';

describe('Password reset flow', () => {
  beforeEach(() => {
    cy.mockPurge();
  });

  context('A11y checks', () => {
    it('Has no detectable a11y violations on reset password page', () => {
      cy.visit('/reset');
      injectAndCheckAxe();
    });

    it('Has no detectable a11y violations on reset password page with error', () => {
      cy.visit('/reset');
      cy.mockNext(500);
      cy.get('input[name="email"]').type('example@example.com');
      cy.contains('Reset Password').click();
      injectAndCheckAxe();
    });

    it('Has no detectable a11y violations on email sent page', function () {
      cy.visit('/reset');
      cy.mockNext(200);
      cy.get('input[name="email"]').type('mrtest@theguardian.com');
      cy.contains('Reset Password').click();
      injectAndCheckAxe();
    });
  });

  context('Valid email already exits', () => {
    it('successfully submits the request', function () {
      cy.visit('/reset');
      cy.mockAll(
        200,
        { userType: 'current' },
        `/user/type/mrtest@theguardian.com`,
      );
      cy.mockAll(200, { token: 'fake_token' }, `/pwd-reset/token`);
      cy.get('input[name="email"]').type('mrtest@theguardian.com');
      cy.contains('Reset Password').click();
      cy.contains('Check your email');
    });
  });

  context(`Email doesn't exist`, () => {
    it('does not communicate that an email does not have an account', function () {
      cy.visit('/reset');
      cy.mockAll(
        200,
        { userType: 'new' },
        `/user/type/mxunregistered@theguardian.com`,
      );
      cy.mockAll(200, { token: 'fake_token' }, `/pwd-reset/token`);
      cy.mockNext(404, {
        status: 'error',
        errors: [{ message: 'Not found' }],
      });
      cy.get('input[name="email"]').type('mxunregistered@theguardian.com');
      cy.contains('Reset Password').click();
      cy.contains('Check your email');
    });
  });

  context('Email field is left blank', () => {
    it('displays the standard HTML validation', () => {
      cy.visit('/reset');
      cy.contains('Reset Password').click();
      cy.get('input[name="email"]:invalid').should('have.length', 1);
    });
  });

  context('Email is invalid', () => {
    it('displays the standard HTML validation', () => {
      cy.visit('/reset');
      cy.get('input[name="email"]').type('bademail£');
      cy.contains('Reset Password').click();
      cy.get('input[name="email"]:invalid').should('have.length', 1);
    });
  });

  context('General IDAPI failure', () => {
    it('displays a generic error message', function () {
      cy.visit('/reset');
      cy.mockAll(500);
      cy.get('input[name="email"]').type('mrtest@theguardian.com');
      cy.contains('Reset Password').click();
      cy.contains('There was a problem');
    });
  });
});
