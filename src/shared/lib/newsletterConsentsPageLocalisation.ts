import { GeoLocation } from '@/shared/model/Geolocation';
import { Newsletters } from '@/shared/model/Newsletter';
import { CONSENTS_NEWSLETTERS_PAGE } from '../model/Consent';

// map of newsletters to country codes
// undefined also included as key, in case of fallback
export const NewsletterMap = new Map<GeoLocation | undefined, Newsletters[]>([
	[
		undefined,
		[
			Newsletters.DOWN_TO_EARTH,
			Newsletters.THE_LONG_READ,
			Newsletters.FIRST_EDITION_UK,
		],
	],
	[
		'ROW',
		[
			Newsletters.DOWN_TO_EARTH,
			Newsletters.THE_LONG_READ,
			Newsletters.FIRST_EDITION_UK,
		],
	],
	[
		'GB',
		[
			Newsletters.DOWN_TO_EARTH,
			Newsletters.THE_LONG_READ,
			Newsletters.FIRST_EDITION_UK,
		],
	],
	[
		'AU',
		[
			Newsletters.MORNING_MAIL_AU,
			Newsletters.AFTERNOON_UPDATE_AU,
			Newsletters.FIVE_GREAT_READS_AU,
			Newsletters.THE_CRUNCH_AU,
		],
	],
	[
		'EU',
		[
			Newsletters.THIS_IS_EUROPE,
			Newsletters.FIRST_EDITION_UK,
			Newsletters.DOWN_TO_EARTH,
			Newsletters.TECHSCAPE,
		],
	],
	[
		'US',
		[
			Newsletters.FIRST_THING_US,
			Newsletters.HEADLINES_US,
			Newsletters.DOWN_TO_EARTH,
			Newsletters.SOCCER_US,
		],
	],
]);

// map of consents for newsletter page to country codes
// undefined also included as key, in case of fallback
export const ConsentsOnNewslettersPageMap = new Map<
	GeoLocation | undefined,
	string[]
>([
	[undefined, CONSENTS_NEWSLETTERS_PAGE],
	['ROW', CONSENTS_NEWSLETTERS_PAGE],
	['GB', CONSENTS_NEWSLETTERS_PAGE],
	['AU', []],
	['EU', []],
	['US', []],
]);
