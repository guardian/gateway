/// <reference types='cypress' />

import { injectAndCheckAxe } from '../../support/cypress-axe';
import PageResetPassword from '../../support/pages/reset_password_page';

describe('Password reset flow', () => {
  const page = new PageResetPassword();

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
      page.submitEmailAddress('example@example.com');
      injectAndCheckAxe();
    });

    it('Has no detectable a11y violations on email sent page', function () {
      cy.visit('/reset');
      cy.mockNext(200);
      page.submitEmailAddress('mrtest@theguardian.com');
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
      page.submitEmailAddress('mrtest@theguardian.com');
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
      page.submitEmailAddress('mxunregistered@theguardian.com');
      cy.contains('Check your email');
    });
  });

  context('Email field is left blank', () => {
    it('displays the standard HTML validation', () => {
      cy.visit('/reset');
      page.clickResetPassword();
      page.invalidEmailAddressField().should('have.length', 1);
    });
  });

  context('Email is invalid', () => {
    it('displays the standard HTML validation', () => {
      cy.visit('/reset');
      page.submitEmailAddress('bademail£');
      page.invalidEmailAddressField().should('have.length', 1);
    });
  });

  context('General IDAPI failure', () => {
    it('displays a generic error message', function () {
      cy.visit('/reset');
      cy.mockAll(500);
      page.submitEmailAddress('mrtest@theguardian.com');
      cy.contains('There was a problem');
    });
  });
});
