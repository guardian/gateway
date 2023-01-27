import { GeoLocation } from '@/shared/model/Geolocation';
import {
  ALL_NEWSLETTER_IDS,
  NewsletterPatch,
  Newsletters,
} from '@/shared/model/Newsletter';

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
      Newsletters.DOWN_TO_EARTH,
      Newsletters.THE_LONG_READ,
      Newsletters.MORNING_BRIEFING_AU,
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

// get a list of newsletters that have been updated in the body and compare
// to list of all newsletter ids
export const newslettersSubscriptionsFromFormBody = (body: {
  [key: string]: unknown;
}): NewsletterPatch[] =>
  ALL_NEWSLETTER_IDS.flatMap((id) => {
    // if the id of a newsletter is included in the body
    // then mark this newsletter as to potentially update (subscribe / unsubscribe)
    // otherwise return undefined
    if (id in body) {
      return {
        id,
        subscribed: !!body[id],
      };
    }

    // return empty array if newsletter not in body
    // flatMap will remove this empty array
    return [];
  });
