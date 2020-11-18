/// <reference types="cypress" />

const qs = require('query-string');

class Onboarding {
  static URL = '/consents';

  static CONTENT = {
    SAVE_CONTINUE_BUTTON: 'Save and continue',
    GO_BACK_BUTTON: 'Go back',
  };

  static getBackButton() {
    return cy.contains(Onboarding.CONTENT.GO_BACK_BUTTON);
  }

  static getSaveAndContinueButton() {
    return cy.contains(Onboarding.CONTENT.SAVE_CONTINUE_BUTTON);
  }

  static getCheckboxes() {
    // @TODO: This is generic selector based approach, make a page specific user based approach, e.g. use contains
    return cy.get('[type="checkbox"]');
  }

  static getOptoutCheckboxes() {
    // @TODO: This is generic selector based approach, make a page specific user based approach, e.g. use contains
    return this.getCheckboxes().not('[name*="_optout"]');
  }

  static gotoFlowStart({ failOnStatusCode = true, query = {}, path } = {}) {
    const querystring = qs.stringify(query);

    cy.visit(
      `${Onboarding.URL}${path ? path : ''}${
        querystring ? `?${querystring}` : ''
      }`,
      {
        failOnStatusCode,
      },
    );
  }
}

module.exports = Onboarding;
