import OnboardingPage from './onboarding_page';

class NewslettersPage extends OnboardingPage {
  static CONTENT = {
    ...OnboardingPage.CONTENT,
    NEWSLETTERS: {
      FIRST_EDITION_UK: 'Guardian Morning Briefing',
      MORNING_BRIEFING_US: 'First Thing: the US morning briefing',
      MORNING_BRIEFING_AUS: "Guardian Australia's Morning Mail",
      LONG_READ: 'The Long Read',
      GREEN_LIGHT: 'Green Light',
      THE_GUIDE: 'The Guide',
    },
  };
  static newsletterCheckboxWithTitle(title: string) {
    return cy.contains(title).parent().find('input[type="checkbox"]');
  }
  static URL = '/consents/newsletters';
}

export default NewslettersPage;
