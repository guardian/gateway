import OnboardingPage from './onboarding_page';
//@AB_TEST: 3 Stage Registration Flow Test
class OurContentPage extends OnboardingPage {
	static URL = '/consents/our-content';
	static CONTENT = {
		...OnboardingPage.CONTENT,
		NEWSLETTERS: {
			FIRST_EDITION_UK: 'First Edition',
			FIRST_THING_US: 'First Thing: the US morning briefing',
			HEADLINES_US: 'The Guardian Headlines US',
			OPINION_US: 'The Best of Guardian Opinion: US Edition',
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
		OPT_OUT_MESSAGE:
			'I do NOT wish to be contacted by the Guardian for market research purposes.',
	};

	static consentCheckboxWithTitle(title: string) {
		return cy.contains(title).siblings().find('input[type="checkbox"]');
	}
	static checkboxWithTitle(title: string) {
		return cy.contains(title).parent().find('input[type="checkbox"]');
	}
}

export default OurContentPage;