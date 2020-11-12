const OnboardingPage = require('./onboarding_page');

class YourDataPage extends OnboardingPage {
  static URL = '/consents/data';

  getCheckboxes() {
    return cy.get('[type="checkbox"]');
  }
}

module.exports = YourDataPage;
