import { injectAndCheckAxe } from '../../support/cypress-axe';
import PageResetPassword from '../../support/pages/reset_password_page';

describe('Password reset flow', () => {
  const page = new PageResetPassword();

  before(() => {
    cy.mockPurge();
    cy.fixture('users').as('users');
  });

  beforeEach(function () {
    page.goto();
  });

  context('A11y checks', () => {
    it('Has no detectable a11y violations on reset password page', () => {
      injectAndCheckAxe();
    });

    it('Has no detectable a11y violations on reset password page with error', () => {
      cy.mockNext(500);
      page.submitEmailAddress('example@example.com');
      injectAndCheckAxe();
    });

    it('Has no detectable a11y violations on email sent page', function () {
      const { email } = this.users.validEmail;
      cy.mockNext(200);
      page.submitEmailAddress(email);
      injectAndCheckAxe();
    });
  });

  context('Valid email already exits', () => {
    it('successfully submits the request', function () {
      const { email } = this.users.validEmail;
      cy.mockNext(200);
      page.submitEmailAddress(email);
      cy.contains('Check your email');
    });
  });

  context(`Email doesn't exist`, () => {
    it('shows a message saying the email address does not exist', function () {
      const { email } = this.users.emailNotRegistered;
      cy.mockNext(404, {
        status: 'error',
        errors: [{ message: 'Not found' }],
      });
      page.submitEmailAddress(email);
      cy.contains(PageResetPassword.CONTENT.ERRORS.NO_ACCOUNT);
    });
  });

  context('Email field is left blank', () => {
    it('displays the standard HTML validation', () => {
      page.clickResetPassword();
      page.invalidEmailAddressField().should('have.length', 1);
    });
  });

  context('Email is invalid', () => {
    it('displays the standard HTML validation', () => {
      page.submitEmailAddress('bademail£');
      page.invalidEmailAddressField().should('have.length', 1);
    });
  });

  context('General IDAPI failure', () => {
    it('displays a generic error message', function () {
      const { email } = this.users.validEmail;
      cy.mockNext(500);
      page.submitEmailAddress(email);
      cy.contains(PageResetPassword.CONTENT.ERRORS.GENERIC);
    });
  });
});
