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
    NEWSLETTER_SECTION_TITLE: 'Newsletters',
    SUPPORTER_CONSENT_TITLE: 'Products & services:',
    BUTTON_RETURN_GUARDIAN: 'Return to the Guardian',
    NO_NEWSLETTERS_TITLE: 'Didn’t find anything you like?',
  };

  static returnButton() {
    return cy.contains(ReviewPage.CONTENT.BUTTON_RETURN_GUARDIAN);
  }
}

export default ReviewPage;
