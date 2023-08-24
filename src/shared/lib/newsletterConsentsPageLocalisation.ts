import {
	GeoLocation,
	PermissionedGeolocation,
} from '@/shared/model/Geolocation';
import { Newsletters } from '@/shared/model/Newsletter';
import { CONSENTS_NEWSLETTERS_PAGE } from '../model/Consent';

// Permissions a geolocation if cmp consent is true
export const getPermissionedGeolocation = (
	cmpConsentState: boolean | undefined,
	geolocation: GeoLocation | undefined,
): GeoLocation | PermissionedGeolocation | undefined => {
	if (!!cmpConsentState && geolocation === 'AU') return 'AU_permissioned';
	if (!!cmpConsentState && geolocation === 'US') return 'US_permissioned';
	if (!!cmpConsentState && geolocation === 'EU') return 'EU_permissioned';
	return geolocation;
};

// map of newsletters to country codes
// undefined also included as key, in case of fallback
export const NewsletterMap = new Map<
	GeoLocation | PermissionedGeolocation | undefined,
	Newsletters[]
>([
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
			Newsletters.DOWN_TO_EARTH,
			Newsletters.THE_LONG_READ,
			Newsletters.MORNING_MAIL_AU,
		],
	],
	[
		'AU_permissioned',
		[
			Newsletters.MORNING_MAIL_AU,
			Newsletters.AFTERNOON_UPDATE_AU,
			Newsletters.FIVE_GREAT_READS_AU,
			Newsletters.SAVED_FOR_LATER_AU,
		],
	],
	[
		'EU',
		[
			Newsletters.DOWN_TO_EARTH,
			Newsletters.THE_LONG_READ,
			Newsletters.FIRST_EDITION_UK,
		],
	],
	[
		'EU_permissioned',
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
			Newsletters.DOWN_TO_EARTH,
			Newsletters.THE_LONG_READ,
			Newsletters.FIRST_THING_US,
		],
	],
	[
		'US_permissioned',
		[
			Newsletters.FIRST_THING_US,
			Newsletters.HEADLINES_US,
			Newsletters.DOWN_TO_EARTH,
			Newsletters.OPINION_US,
		],
	],
]);

// map of consents for newsletter page to country codes
// undefined also included as key, in case of fallback
export const ConsentsOnNewslettersPageMap = new Map<
	GeoLocation | PermissionedGeolocation | undefined,
	string[]
>([
	[undefined, CONSENTS_NEWSLETTERS_PAGE],
	['ROW', CONSENTS_NEWSLETTERS_PAGE],
	['GB', CONSENTS_NEWSLETTERS_PAGE],
	['AU', CONSENTS_NEWSLETTERS_PAGE],
	['AU_permissioned', []],
	['EU', CONSENTS_NEWSLETTERS_PAGE],
	['EU_permissioned', []],
	['US', CONSENTS_NEWSLETTERS_PAGE],
	['US_permissioned', []],
]);
