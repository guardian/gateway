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
			// @AB_TEST: Default Weekly Newsletter Test:
			Newsletters.SATURDAY_ROUNDUP_TRIAL,
		],
	],
	[
		'AU',
		[
			Newsletters.DOWN_TO_EARTH,
			Newsletters.THE_LONG_READ,
			Newsletters.MORNING_MAIL_AU,
			// @AB_TEST: Default Weekly Newsletter Test:
			Newsletters.SATURDAY_ROUNDUP_TRIAL,
		],
	],
	[
		'AU_permissioned',
		[
			Newsletters.MORNING_MAIL_AU,
			Newsletters.AFTERNOON_UPDATE_AU,
			Newsletters.FIVE_GREAT_READS_AU,
			Newsletters.SAVED_FOR_LATER_AU,
			// @AB_TEST: Default Weekly Newsletter Test:
			Newsletters.SATURDAY_ROUNDUP_TRIAL,
		],
	],
	[
		'US',
		[
			Newsletters.DOWN_TO_EARTH,
			Newsletters.THE_LONG_READ,
			Newsletters.FIRST_THING_US,
			// @AB_TEST: Default Weekly Newsletter Test:
			Newsletters.SATURDAY_ROUNDUP_TRIAL,
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
	['US', CONSENTS_NEWSLETTERS_PAGE],
	['US_permissioned', []],
]);
