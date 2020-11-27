/// <reference types="cypress" />

const qs = require('query-string');

class Onboarding {
  static URL = '/consents';

  static CONTENT = {
    SAVE_CONTINUE_BUTTON: 'Save and continue',
    GO_BACK_BUTTON: 'Go back',
    REPORT_ERROR_LINK: 'Report this error',
  };

  static backButton() {
    return cy.contains(Onboarding.CONTENT.GO_BACK_BUTTON);
  }

  static saveAndContinueButton() {
    return cy.contains(Onboarding.CONTENT.SAVE_CONTINUE_BUTTON);
  }

  static allCheckboxes() {
    // @TODO: This is generic selector based approach, make a page specific user based approach, e.g. use contains
    return cy.get('[type="checkbox"]');
  }

  static allOptoutCheckboxes() {
    // @TODO: This is generic selector based approach, make a page specific user based approach, e.g. use contains
    return this.allCheckboxes().not('[name*="_optout"]');
  }

  static errorBanner() {
    return cy.contains(Onboarding.CONTENT.REPORT_ERROR_LINK).parent();
  }

  static goto() {
    cy.visit(this.URL, { failOnStatusCode: false });
  }

  static gotoFlowStart({ failOnStatusCode = true, query = {} } = {}) {
    const querystring = qs.stringify(query);

    cy.visit(`${Onboarding.URL}${querystring ? `?${querystring}` : ''}`, {
      failOnStatusCode,
    });
  }
}

module.exports = Onboarding;
