import { GeoLocation } from '@/shared/model/Geolocation';
import { Newsletters } from '@/shared/model/Newsletter';

// map of newsletters to country codes
// undefined also included as key, in case of fallback
export const NewsletterMap = new Map<GeoLocation | undefined, Newsletters[]>([
  [
    undefined,
    [
      Newsletters.TODAY_UK,
      Newsletters.THE_LONG_READ,
      Newsletters.GREENLIGHT,
      Newsletters.BOOKMARKS,
    ] as Newsletters[],
  ],
  [
    'ROW' as GeoLocation,
    [
      Newsletters.TODAY_UK,
      Newsletters.THE_LONG_READ,
      Newsletters.GREENLIGHT,
      Newsletters.BOOKMARKS,
    ] as Newsletters[],
  ],
  [
    'GB' as GeoLocation,
    [
      Newsletters.TODAY_UK,
      Newsletters.THE_LONG_READ,
      Newsletters.GREENLIGHT,
      Newsletters.BOOKMARKS,
    ] as Newsletters[],
  ],
  [
    'AU' as GeoLocation,
    [
      Newsletters.TODAY_AU,
      Newsletters.THE_LONG_READ,
      Newsletters.GREENLIGHT,
      Newsletters.BOOKMARKS,
    ] as Newsletters[],
  ],
  [
    'US' as GeoLocation,
    [
      Newsletters.TODAY_US,
      Newsletters.US_MORNING_BRIEFING,
      Newsletters.MINUTE_US,
      Newsletters.GREENLIGHT,
    ] as Newsletters[],
  ],
]);
