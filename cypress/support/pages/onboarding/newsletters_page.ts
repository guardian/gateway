import OnboardingPage from './onboarding_page';

class NewslettersPage extends OnboardingPage {
	static CONTENT = {
		...OnboardingPage.CONTENT,
		NEWSLETTERS: {
			FIRST_EDITION_UK: 'First Edition',
			FIRST_THING_US: 'First Thing: the US morning briefing',
			HEADLINES_US: 'The Guardian Headlines US',
			SOCCER_US: 'Soccer with Jonathan Wilson',
			LONG_READ: 'The Long Read',
			GREEN_LIGHT: 'Green Light',
			MORNING_MAIL_AU: "Guardian Australia's Morning Mail",
			AFTERNOON_UPDATE_AU: "Guardian Australia's Afternoon Update",
			FIVE_GREAT_READS_AU: 'Five Great Reads',
			THE_CRUNCH_AU: 'The Crunch',
			TECHSCAPE: 'TechScape',
			THIS_IS_EUROPE: 'This is Europe',
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
