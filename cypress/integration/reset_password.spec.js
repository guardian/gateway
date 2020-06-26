/// <reference types="cypress" />

const PageResetPassword = require('../support/pages/reset_password_page');
const PageResetSent = require('../support/pages/reset_sent_page');

describe("Password reset flow", () => {
  const page = new PageResetPassword();

  before(() => {
    cy.idapiMockPurge();
  });

  beforeEach(function () {
    cy.fixture('users').as('users');
    page.goto();
  });

  context("Valid email already exits", () => {
    it("successfully submits the request", function () {
      const { email } = this.users.validEmail;
      cy.idapiMock(200);
      page.submitEmailAddress(email);
      cy.contains(PageResetSent.CONTENT.CONFIRMATION);
    });
  });

  context("Email doesn't exist", () => {
    it('shows a message saying the email address does not exist', function () {
      const { email } = this.users.emailNotRegistered;
      cy.idapiMock(404, {
        status: 'error',
        errors: [{ message: 'Not found' }]
      });
      page.submitEmailAddress(email);
      cy.contains(PageResetPassword.CONTENT.ERRORS.NO_ACCOUNT);
    });
  });

  context("Email field is left blank", () => {
    it('displays a message saying an email address is needed', () => {
      cy.idapiMock(500, {
        status: 'error',
        errors: [{ message: 'Required field missing' }]
      });
      page.clickResetPassword();
      cy.contains(PageResetPassword.CONTENT.ERRORS.NO_EMAIL);
    });
  });

  context("General IDAPI failure", () => {
    it('displays a generic error message', () => {
      cy.idapiMock(500);
      page.clickResetPassword();
      cy.contains(PageResetPassword.CONTENT.ERRORS.GENERIC);
    });
  })
});
