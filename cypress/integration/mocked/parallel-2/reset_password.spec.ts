import { injectAndCheckAxe } from '../../../support/cypress-axe';
import PageResetPassword from '../../../support/pages/reset_password_page';

describe('Password reset flow', () => {
  const page = new PageResetPassword();

  before(() => {
    cy.mockPurge();
    cy.fixture('users').as('users');
  });

  beforeEach(function () {
    cy.mockPurge();
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

  context('Recaptcha errors', () => {
    it('shows recaptcha error message when reCAPTCHA token request fails', function () {
      cy.intercept('POST', 'https://www.google.com/recaptcha/api2/**', {
        statusCode: 500,
      });
      const { email } = this.users.emailNotRegistered;
      page.submitEmailAddress(email);
      cy.contains('Google reCAPTCHA verification failed. Please try again.');
    });

    it('shows detailed recaptcha error message when reCAPTCHA token request fails two times', function () {
      cy.intercept('POST', 'https://www.google.com/recaptcha/api2/**', {
        statusCode: 500,
      });
      const { email } = this.users.emailNotRegistered;
      page.submitEmailAddress(email);
      cy.contains('Google reCAPTCHA verification failed. Please try again.');
      page.emailAddressField().clear();
      page.submitEmailAddress(email);
      cy.contains('Google reCAPTCHA verification failed.');
      cy.contains('If the problem persists please try the following:');
      cy.contains('userhelp@');
    });
  });
});
