import * as qs from 'query-string';

class Onboarding {
  static URL = '/consents';

  static CONTENT = {
    CONTINUE_BUTTON: 'Continue',
    PREVIOUS_BUTTON: 'Go back',
    REPORT_ERROR_LINK: 'Report this error',
  };

  static backButton() {
    return cy.contains(Onboarding.CONTENT.PREVIOUS_BUTTON);
  }

  static saveAndContinueButton() {
    return cy.contains(Onboarding.CONTENT.CONTINUE_BUTTON);
  }

  static allCheckboxes() {
    // @TODO: This is generic selector based approach, make a page specific user based approach, e.g. use contains
    return cy.get('[type="checkbox"]');
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

export default Onboarding;
