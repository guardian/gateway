export interface NewsLetter {
	id: string;
	nameId: string;
	description: string;
	frequency?: string;
	name: string;
	subscribed?: boolean;
}

export enum Newsletters {
	DOWN_TO_EARTH = '4147',
	FIRST_EDITION_UK = '4156',
	THE_LONG_READ = '4165',
	// US newsletters
	HEADLINES_US = '4152',
	FIRST_THING_US = '4300',
	SOCCER_US = '6030',
	// AUS newsletters
	MORNING_MAIL_AU = '4148',
	AFTERNOON_UPDATE_AU = '6023',
	FIVE_GREAT_READS_AU = '6019',
	THE_CRUNCH_AU = '6034',
	// EU newsletters
	TECHSCAPE = '6013',
	THIS_IS_EUROPE = '4234',
	// Registration Newsletter
	SATURDAY_EDITION = '6031',
	FEAST = '6002',
	WEEKEND_MAIL_AU = '6043',
	WEEKEND_US = '6044',
	// Registration newsletter bundles (parsed to individual newsletters in the backend)
	AU_BUNDLE = 'auBundle',
	US_BUNDLE = 'usBundle',
}

export const REGISTRATION_NEWSLETTERS: string[] = [
	Newsletters.SATURDAY_EDITION,
	Newsletters.FEAST,
	Newsletters.WEEKEND_MAIL_AU,
	Newsletters.WEEKEND_US,
];

export const ALL_NEWSLETTER_IDS = Object.values(Newsletters);

type RegistrationNewsletterFormIds =
	| 'saturdayEdition'
	| 'feast'
	| 'auBundle'
	| 'usBundle';

export interface RegistrationNewsletterFormFields {
	id: Newsletters;
	label: string;
	context: string;
}

export const RegistrationNewslettersFormFieldsMap: Record<
	RegistrationNewsletterFormIds,
	RegistrationNewsletterFormFields
> = {
	saturdayEdition: {
		id: Newsletters.SATURDAY_EDITION,
		label: 'Saturday Edition newsletter',
		context:
			'An exclusive email highlighting the week’s best Guardian journalism from the editor-in-chief, Katharine Viner.',
	},
	feast: {
		id: Newsletters.FEAST,
		label: 'Feast newsletter',
		context:
			'A weekly email from Yotam Ottolenghi, Meera Sodha, Felicity Cloake and Rachel Roddy, featuring the latest recipes and seasonal eating ideas.',
	},
	auBundle: {
		id: Newsletters.AU_BUNDLE,
		label: 'Saturday newsletters',
		context:
			"Get an exclusive, curated view of the week's best Guardian journalism from around the world by editor-in-chief Katharine Viner, and the local view from Guardian Australia editor Lenore Taylor.",
	},
	usBundle: {
		id: Newsletters.US_BUNDLE,
		label: 'Weekend newsletters',
		context:
			"Get an exclusive, curated view of the week's best Guardian journalism from editor-in-chief Katharine Viner and more on the latest news from the US.",
	},
};

export const newsletterBundleToIndividualNewsletters = (
	bundleId: Newsletters.US_BUNDLE | Newsletters.AU_BUNDLE,
): Newsletters[] => {
	switch (bundleId) {
		case Newsletters.US_BUNDLE:
			return [Newsletters.SATURDAY_EDITION, Newsletters.WEEKEND_US];
		case Newsletters.AU_BUNDLE:
			return [Newsletters.SATURDAY_EDITION, Newsletters.WEEKEND_MAIL_AU];
		default:
			return [];
	}
};

export const newsletterAdditionalTerms =
	'Newsletters may contain information about Guardian products, services and chosen charities or online advertisements.';
