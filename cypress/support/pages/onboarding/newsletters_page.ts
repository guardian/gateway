import OnboardingPage from './onboarding_page';

class NewslettersPage extends OnboardingPage {
  static CONTENT = {
    ...OnboardingPage.CONTENT,
    NEWSLETTERS: {
      FIRST_EDITION_UK: 'First Edition',
      MORNING_BRIEFING_US: 'First Thing: the US morning briefing',
      LONG_READ: 'The Long Read',
      GREEN_LIGHT: 'Green Light',
      MORNING_MAIL_AU: "Guardian Australia's Morning Mail",
      AFTERNOON_UPDATE_AU: "Guardian Australia's Afternoon Update",
      FIVE_GREAT_READS_AU: 'Five Great Reads',
      SAVED_FOR_LATER_AU: 'Saved for Later',
    },
    Consents: {
      EVENTS: 'Events & Masterclasses',
    },
  };
  static checkboxWithTitle(title: string) {
    return cy.contains(title).parent().find('input[type="checkbox"]');
  }
  static URL = '/consents/newsletters';
}

export default NewslettersPage;
