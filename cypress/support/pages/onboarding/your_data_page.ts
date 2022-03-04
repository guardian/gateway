import OnboardingPage from './onboarding_page';

class YourDataPage extends OnboardingPage {
  static URL = '/consents/data';
  static CONTENT = {
    ...OnboardingPage.CONTENT,
    OPT_IN_MESSAGE:
      'Allow the Guardian to analyse this data to improve marketing content',
  };

  static marketingOptInClickableSection() {
    return cy.contains(this.CONTENT.OPT_IN_MESSAGE);
  }

  static marketingOptInSwitch() {
    return cy.contains(this.CONTENT.OPT_IN_MESSAGE).find('input');
  }
}

export default YourDataPage;
