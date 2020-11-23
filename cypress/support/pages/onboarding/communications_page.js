const OnboardingPage = require('./onboarding_page');

class CommunicationsPage extends OnboardingPage {
  static URL = '/consents/communication';
  static CONTENT = {
    OPT_OUT_MESSAGE:
      'I do NOT wish to be contacted by The Guardian for market research purposes.',
  };

  static getMarketingOptoutClickableSection() {
    return cy.contains(CommunicationsPage.CONTENT.OPT_OUT_MESSAGE).parent();
  }
}

module.exports = CommunicationsPage;
