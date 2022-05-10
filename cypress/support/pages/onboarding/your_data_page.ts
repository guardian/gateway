import OnboardingPage from './onboarding_page';

class YourDataPage extends OnboardingPage {
  static URL = '/consents/data';
  static CONTENT = {
    ...OnboardingPage.CONTENT,
    OPT_IN_MESSAGE:
      'Allow the Guardian to analyse this data to improve marketing content',
    ADVERTISING_MESSAGE:
      'Allow personalised advertising using this data - this supports the Guardian',
  };

  static marketingOptInClickableSection() {
    return cy.contains(this.CONTENT.OPT_IN_MESSAGE);
  }

  static marketingOptInSwitch() {
    return cy.contains(this.CONTENT.OPT_IN_MESSAGE).find('input');
  }

  static personalisedAdvertisingOptIn() {
    return cy.contains(this.CONTENT.ADVERTISING_MESSAGE);
  }

  // use to verify checked/unchecked value
  static personalisedAdvertisingOptInInput() {
    return cy.contains(this.CONTENT.ADVERTISING_MESSAGE).find('input');
  }
  // use to "click" because the checkbok input has no css visibility
  static personalisedAdvertisingOptInSwitch() {
    return cy.contains(this.CONTENT.ADVERTISING_MESSAGE).find('span');
  }
}

export default YourDataPage;
