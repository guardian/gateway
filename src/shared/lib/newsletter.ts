import { GeoLocation } from '@/shared/model/Geolocation';
import { Newsletters } from '@/shared/model/Newsletter';

// map of newsletters to country codes
// undefined also included as key, in case of fallback
export const NewsletterMap = new Map<GeoLocation | undefined, Newsletters[]>([
  [
    undefined,
    [
      Newsletters.TODAYUK,
      Newsletters.THELONGREAD,
      Newsletters.GREENLIGHT,
      Newsletters.BOOKMARKS,
    ] as Newsletters[],
  ],
  [
    'ROW' as GeoLocation,
    [
      Newsletters.TODAYUK,
      Newsletters.THELONGREAD,
      Newsletters.GREENLIGHT,
      Newsletters.BOOKMARKS,
    ] as Newsletters[],
  ],
  [
    'GB' as GeoLocation,
    [
      Newsletters.TODAYUK,
      Newsletters.THELONGREAD,
      Newsletters.GREENLIGHT,
      Newsletters.BOOKMARKS,
    ] as Newsletters[],
  ],
  [
    'AU' as GeoLocation,
    [
      Newsletters.TODAYAU,
      Newsletters.THELONGREAD,
      Newsletters.GREENLIGHT,
      Newsletters.BOOKMARKS,
    ] as Newsletters[],
  ],
  [
    'US' as GeoLocation,
    [
      Newsletters.TODAYUS,
      Newsletters.THELONGREAD,
      Newsletters.GREENLIGHT,
      Newsletters.BOOKMARKS,
    ] as Newsletters[],
  ],
]);
