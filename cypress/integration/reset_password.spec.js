/// <reference types="cypress" />

const BASE_URL = 'localhost:8080';

describe("Password reset flow", () => {
  const pageUrl = `${BASE_URL}/reset`;
  beforeEach(() => {
    cy.visit(pageUrl);
  });
  
  context("Valid email already exits", () => {
    it("successfully submits the request", () => {
      cy.get('input[name="email"]')
        .type('patrick.orrell+codetest5@theguardian.com');
      
      cy.contains('Reset Password')
        .click();
      
      cy.contains('We’ve sent you an email – please open it up and click on the button');
    });
  });

  context("Email doesn't exist", () => {
    it('shows a message saying the email address does not exist', () => {
      cy.get('input[name="email"]')
        .type('patrick.orrell+doesntexist@theguardian.com');
      
      cy.contains('Reset Password')
        .click();

      cy.contains('There is no account for that email address, please check for typos or create an account');
    });
  });

  context("Email field is left blank", () => {
    it('displays a message saying an email address is needed', () => {
      cy.contains('Reset Password')
      .click();
 
      cy.contains('Email field must not be blank.');
    });
  });
});
