const OnboardingPage = require('./onboarding_page');

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
      JOBS: 'Jobs',
      HOLIDAYS: 'Holidays & Vacations',
      EVENTS: 'Events & Masterclasses',
      OFFERS: 'Offers',
    },
    CONSENT_OPTOUT: {
      RESEARCH: 'Marketing research',
      ANALYSIS: 'Marketing analysis',
    },
    NEWSLETTER_SECTION_TITLE: 'Newsletters',
    CONSENTS_SECTION_TITLE: 'Products & services:',
    BUTTON_RETURN_GUARDIAN: 'Return to The Guardian',
  };

  static getReturnButton() {
    return cy.contains(ReviewPage.CONTENT.BUTTON_RETURN_GUARDIAN);
  }

  static getConsentsSection() {
    return cy
      .contains(ReviewPage.CONTENT.CONSENTS_SECTION_TITLE)
      .parent()
      .siblings();
  }

  static getNewslettersSection() {
    return cy
      .contains(ReviewPage.CONTENT.NEWSLETTER_SECTION_TITLE)
      .parent()
      .siblings();
  }

  static getMarketingResearchChoice() {
    return cy
      .contains(ReviewPage.CONTENT.CONSENT_OPTOUT.RESEARCH)
      .parent()
      .siblings()
      .children();
  }

  static getMarketingAnalysisChoice() {
    return cy
      .contains(ReviewPage.CONTENT.CONSENT_OPTOUT.ANALYSIS)
      .parent()
      .siblings()
      .children();
  }
}

module.exports = ReviewPage;
