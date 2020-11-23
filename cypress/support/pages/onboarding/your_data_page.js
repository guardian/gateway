const OnboardingPage = require('./onboarding_page');

class YourDataPage extends OnboardingPage {
  static URL = '/consents/data';
  static CONTENT = {
    OPT_OUT_MESSAGE:
      'I do NOT want The Guardian to use my personal data for marketing analysis.',
  };

  static getMarketingOptoutClickableSection() {
    return cy.contains(this.CONTENT.OPT_OUT_MESSAGE).parent();
  }
}

module.exports = YourDataPage;
