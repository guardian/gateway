/// <reference types="cypress" />

const qs = require('query-string');

class Onboarding {
  static URL = '/consents';

  static CONTENT = {
    SAVE_CONTINUE_BUTTON: 'Save and continue',
    GO_BACK_BUTTON: 'Go back',
    COMMUNICATION_PAGE: '/communication',
    NEWSLETTER_PAGE: '/newsletters',
  };

  goto({ failOnStatusCode = true, query = {}, path } = {}) {
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
