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
}

export const ALL_NEWSLETTER_IDS = Object.values(Newsletters);

export const RegistrationNewslettersFormFields = {
	saturdayEdition: {
		id: Newsletters.SATURDAY_EDITION,
		label: 'Saturday Edition',
		context:
			'An exclusive email highlighting the week’s best Guardian journalism from the editor-in-chief, Katharine Viner.',
	},
	feast: {
		id: Newsletters.FEAST,
		label: 'Feast',
		context:
			'A weekly email from Yotam Ottolenghi, Meera Sodha, Felicity Cloake and Rachel Roddy, featuring the latest recipes and seasonal eating ideas.',
	},
};

export const newsletterAdditionalTerms =
	'Newsletters may contain information about Guardian products, services and chosen charities or online advertisements.';
