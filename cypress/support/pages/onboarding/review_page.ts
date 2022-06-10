import OnboardingPage from './onboarding_page';

class ReviewPage extends OnboardingPage {
  static URL = '/consents/review';
  static CONTENT = {
    ...OnboardingPage.CONTENT,
    NEWSLETTERS: {
      GREEN_LIGHT: 'Green Light',
      LONG_READ: 'The Long Read',
      FIRST_EDITION_UK: 'First Edition',
    },
    SUPPORTER_CONSENT: 'Supporting the Guardian',
    PROFILING_CONSENT: 'Allow analysis of my data for marketing',
    PERSONALISED_ADVERTISING_CONSENT:
      'Allow personalised advertising using my data - this supports the Guardian',
    BUTTON_RETURN_GUARDIAN: 'Return to the Guardian',
    NO_NEWSLETTERS_TITLE: 'Didn’t find anything you like?',
  };

  static returnButton() {
    return cy.contains(ReviewPage.CONTENT.BUTTON_RETURN_GUARDIAN);
  }
}

export default ReviewPage;
