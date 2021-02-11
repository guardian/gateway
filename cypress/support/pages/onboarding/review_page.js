import OnboardingPage from './onboarding_page';

class ReviewPage extends OnboardingPage {
  static URL = '/consents/review';
  static CONTENT = {
    NEWSLETTERS: {
      TODAY_UK: 'Guardian Today: UK',
      LONG_READ: 'The Long Read',
      GREEN_LIGHT: 'Green Light',
      BOOKMARKS: 'Bookmarks',
    },
    CONSENT: {
      SUBSCRIPTIONS: 'Subscriptions, membership and contributions',
    },
    CONSENT_OPTOUT: {
      RESEARCH: 'Marketing research',
      ANALYSIS: 'Marketing analysis',
    },
    NEWSLETTER_SECTION_TITLE: 'Newsletters',
    CONSENTS_SECTION_TITLE: 'Products & services:',
    BUTTON_RETURN_GUARDIAN: 'Return to The Guardian',
  };

  static returnButton() {
    return cy.contains(ReviewPage.CONTENT.BUTTON_RETURN_GUARDIAN);
  }

  static consentsSection() {
    return cy
      .contains(ReviewPage.CONTENT.CONSENTS_SECTION_TITLE)
      .parent()
      .siblings();
  }

  static newslettersSection() {
    return cy
      .contains(ReviewPage.CONTENT.NEWSLETTER_SECTION_TITLE)
      .parent()
      .siblings();
  }

  static marketingResearchChoice() {
    return cy
      .contains(ReviewPage.CONTENT.CONSENT_OPTOUT.RESEARCH)
      .parent()
      .siblings()
      .children();
  }

  static marketingAnalysisChoice() {
    return cy
      .contains(ReviewPage.CONTENT.CONSENT_OPTOUT.ANALYSIS)
      .parent()
      .siblings()
      .children();
  }
}

export default ReviewPage;
