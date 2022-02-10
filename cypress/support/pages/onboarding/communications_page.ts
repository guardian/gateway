import OnboardingPage from './onboarding_page';

class CommunicationsPage extends OnboardingPage {
  static URL = '/consents/communication';
  static CONTENT = {
    ...OnboardingPage.CONTENT,
    OPT_OUT_MESSAGE:
      'I do NOT wish to be contacted by the Guardian for market research purposes.',
  };

  static consentCheckboxWithTitle(title: string) {
    return cy
      .contains(title)
      .siblings()
      .contains('Yes, sign me up')
      .find('input');
  }
}

export default CommunicationsPage;
