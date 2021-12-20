import { Newsletters } from '@/shared/model/Newsletter';

import {
  BOOKMARKS_IMAGE,
  DOWN_TO_EARTH_IMAGE,
  MORNING_BRIEFING_US_IMAGE,
  TODAY_UK_IMAGE,
  TODAY_US_IMAGE,
  TODAY_AU_IMAGE,
  THE_LONG_READ_IMAGE,
} from '@/client/assets/newsletters';

export const NEWSLETTER_IMAGES = {
  [Newsletters.BOOKMARKS.toString()]: BOOKMARKS_IMAGE,
  [Newsletters.DOWN_TO_EARTH.toString()]: DOWN_TO_EARTH_IMAGE,
  [Newsletters.MORNING_BRIEFING_US.toString()]: MORNING_BRIEFING_US_IMAGE,
  [Newsletters.THE_LONG_READ.toString()]: THE_LONG_READ_IMAGE,
  [Newsletters.TODAY_AU.toString()]: TODAY_AU_IMAGE,
  [Newsletters.TODAY_UK.toString()]: TODAY_UK_IMAGE,
  [Newsletters.TODAY_US.toString()]: TODAY_US_IMAGE,
};
