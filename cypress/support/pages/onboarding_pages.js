/// <reference types="cypress" />

const qs = require('query-string');

class Onboarding {
  static URL = '/consents';

  static CONTENT = {
    SAVE_CONTINUE_BUTTON: 'Save and continue',
    GO_BACK_BUTTON: 'Go back',
    RETURN_GUARDIAN: 'Return to the The Guardian',
    COMMUNICATION_PAGE: '/communication',
    NEWSLETTER_PAGE: '/newsletters',
    DATA_PAGE: '/data',
    REVIEW_PAGE: '/review',
  };

  static CONSENT_OPTOUT = {
    RESEARCH: 'Marketing research',
    ANALYSIS: 'Marketing analysis',
  };

  static CONSENT = {
    SUBSCRIPTIONS: 'Subscriptions, membership and contributions',
    JOBS: 'Jobs',
    HOLIDAYS: 'Holidays & Vacations',
    EVENTS: 'Events & Masterclasses',
    OFFERS: 'Offers',
  };

  static NEWSLETTERS = {
    TODAY_UK: 'Guardian Today: UK',
    LONG_READ: 'The Long Read',
    GREEN_LIGHT: 'Green Light',
    BOOKMARKS: 'Bookmarks',
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
