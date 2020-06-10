/// <reference types="cypress" />

const PageResetPassword = require('../support/pages/reset_password_page');
const PageResetSent = require('../support/pages/reset_sent_page');

describe("Password reset flow", () => {
  const page = new PageResetPassword();

  beforeEach(function() {
    cy.fixture('users').as('users');
    page.goto();
  });
  
  context("Valid email already exits", () => {
    it("successfully submits the request", function () {
      const { email } = this.users.validEmail;
      page.submitEmailAddress(email);
      cy.contains(PageResetSent.CONTENT.CONFIRMATION);
    });
  });

  context("Email doesn't exist", () => {
    it('shows a message saying the email address does not exist', function () {
      const { email } = this.users.emailNotRegistered;
      page.submitEmailAddress(email);
      cy.contains(PageResetPassword.CONTENT.ERRORS.NO_ACCOUNT);
    });
  });

  context("Email field is left blank", () => {
    it('displays a message saying an email address is needed', () => {
      page.clickResetPassword();
      cy.contains(PageResetPassword.CONTENT.ERRORS.NO_EMAIL);
    });
  });
});
