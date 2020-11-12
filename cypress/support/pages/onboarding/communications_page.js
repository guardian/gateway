const OnboardingPage = require('./onboarding_page');

class CommunicationsPage extends OnboardingPage {
  static URL = '/consents/communication';

  getCheckboxes() {
    return cy.get('[type="checkbox"]');
  }

  getOptinCheckboxes() {
    return this.getCheckboxes().not('[name*="_optout"]');
  }
}

module.exports = CommunicationsPage;
