import { Literal } from '@/shared/types';
export interface NewsLetter {
	id: string;
	nameId: string;
	description: string;
	frequency?: string;
	name: string;
	subscribed?: boolean;
}

export const Newsletters = {
	// General newsletters
	WELL_ACTUALLY: '6039',
	// US newsletters
	HEADLINES_US: '4152',
	THE_STAKES_US: '6042',
	TRUMP_ON_TRIAL_US: '6032',
	// AUS newsletters
	MORNING_MAIL_AU: '4148',
	AFTERNOON_UPDATE_AU: '6023',
	THE_CRUNCH_AU: '6034',
	SAVED_FOR_LATER_AU: '6003',
	// Registration newsletters
	SATURDAY_EDITION: '6031',
	FEAST: '6002',
	WEEKEND_MAIL_AU: '6043',
	WEEKEND_US: '6044',
	// Registration newsletter bundles (parsed to individual newsletters in the backend)
	AU_BUNDLE: 'auBundle',
	US_BUNDLE: 'usBundle',
} as const;

export type NewslettersWithImages =
	| typeof Newsletters.MORNING_MAIL_AU
	| typeof Newsletters.AFTERNOON_UPDATE_AU
	| typeof Newsletters.SAVED_FOR_LATER_AU
	| typeof Newsletters.THE_CRUNCH_AU
	| typeof Newsletters.HEADLINES_US
	| typeof Newsletters.THE_STAKES_US
	| typeof Newsletters.WELL_ACTUALLY
	| typeof Newsletters.TRUMP_ON_TRIAL_US;

export const ALL_NEWSLETTER_IDS = Object.values(Newsletters);

type RegistrationNewsletterFormIds =
	| 'saturdayEdition'
	| 'feast'
	| 'jobs'
	| 'auBundle'
	| 'usBundle';

export interface RegistrationNewsletterFormFields {
	id: Literal<typeof Newsletters>;
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
	jobs: {
		id: Newsletters.SATURDAY_EDITION,
		label: 'Saturday Edition newsletter',
		context:
			'You may be interested in this exclusive email highlighting the week’s best Guardian journalism from the editor-in-chief, Katharine Viner. Toggle to opt out.',
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
	bundleId: typeof Newsletters.US_BUNDLE | typeof Newsletters.AU_BUNDLE,
): Literal<typeof Newsletters>[] => {
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
