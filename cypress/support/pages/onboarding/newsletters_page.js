const OnboardingPage = require('./onboarding_page');

class NewslettersPage extends OnboardingPage {
  static URL = '/consents/newsletters';

  getCheckboxes() {
    return cy.get('[type="checkbox"]');
  }
}

module.exports = NewslettersPage;
