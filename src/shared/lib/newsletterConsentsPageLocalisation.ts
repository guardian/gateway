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
): GeoLocation | PermissionedGeolocation | undefined =>
  !!cmpConsentState && geolocation === 'AU' ? 'AU_permissioned' : geolocation;

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
    'US',
    [
      Newsletters.DOWN_TO_EARTH,
      Newsletters.THE_LONG_READ,
      Newsletters.MORNING_BRIEFING_US,
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
]);
