import OnboardingPage from './onboarding_page';

class YourDataPage extends OnboardingPage {
  static URL = '/consents/data';
  static CONTENT = {
    ...OnboardingPage.CONTENT,
    OPT_OUT_MESSAGE:
      'I do NOT want the Guardian to use my personal data for marketing analysis.',
  };

  static marketingOptoutClickableSection() {
    return cy.contains(this.CONTENT.OPT_OUT_MESSAGE).parent();
  }

  static marketingOptoutCheckbox() {
    return cy.contains(this.CONTENT.OPT_OUT_MESSAGE).parent().find('input');
  }
}

export default YourDataPage;
