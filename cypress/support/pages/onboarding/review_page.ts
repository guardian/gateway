import OnboardingPage from './onboarding_page';

class ReviewPage extends OnboardingPage {
  static URL = '/consents/review';
  static CONTENT = {
    ...OnboardingPage.CONTENT,
    NEWSLETTERS: {
      TODAY_UK: 'Guardian Today: UK',
      LONG_READ: 'The Long Read',
      GREEN_LIGHT: 'Green Light',
      BOOKMARKS: 'Bookmarks',
    },
    SUPPORTER_CONSENT: 'Supporting the Guardian',
    PROFILING_CONSENT: 'Allow analysis of my data for marketing',
    BUTTON_RETURN_GUARDIAN: 'Return to the Guardian',
    NO_NEWSLETTERS_TITLE: 'Didn’t find anything you like?',
  };

  static returnButton() {
    return cy.contains(ReviewPage.CONTENT.BUTTON_RETURN_GUARDIAN);
  }
}

export default ReviewPage;
