import { Newsletters } from '@/shared/model/Newsletter';
import { brand, lifestyle, news } from '@guardian/source-foundations';

import {
  DOWN_TO_EARTH_IMAGE,
  FIRST_EDITION_UK_IMAGE,
  MORNING_BRIEFING_US_IMAGE,
  THE_LONG_READ_IMAGE,
  MORNING_MAIL_AU_IMAGE,
  AFTERNOON_UPDATE_AU_IMAGE,
  FIVE_GREAT_READS_AU_IMAGE,
  SAVED_FOR_LATER_AU_IMAGE,
} from '@/client/assets/newsletters';

export const NEWSLETTER_IMAGES: Record<string, string> = {
  [Newsletters.DOWN_TO_EARTH]: DOWN_TO_EARTH_IMAGE,
  [Newsletters.FIRST_EDITION_UK]: FIRST_EDITION_UK_IMAGE,
  [Newsletters.MORNING_BRIEFING_US]: MORNING_BRIEFING_US_IMAGE,
  [Newsletters.THE_LONG_READ]: THE_LONG_READ_IMAGE,
  [Newsletters.MORNING_MAIL_AU]: MORNING_MAIL_AU_IMAGE,
  [Newsletters.AFTERNOON_UPDATE_AU]: AFTERNOON_UPDATE_AU_IMAGE,
  [Newsletters.FIVE_GREAT_READS_AU]: FIVE_GREAT_READS_AU_IMAGE,
  [Newsletters.SAVED_FOR_LATER_AU]: SAVED_FOR_LATER_AU_IMAGE,
};

export const NEWSLETTER_IMAGE_POSITIONS: Record<string, string> = {
  [Newsletters.FIRST_EDITION_UK]: 'bottom left',
  [Newsletters.MORNING_MAIL_AU]: 'bottom left',
  [Newsletters.AFTERNOON_UPDATE_AU]: 'bottom left',
};

export const NEWSLETTER_COLOURS: Record<string, string> = {
  [Newsletters.DOWN_TO_EARTH]: news[400],
  [Newsletters.FIRST_EDITION_UK]: news[400],
  [Newsletters.MORNING_BRIEFING_US]: news[400],
  [Newsletters.THE_LONG_READ]: brand[400],
  [Newsletters.MORNING_MAIL_AU]: news[400],
  [Newsletters.AFTERNOON_UPDATE_AU]: news[400],
  [Newsletters.FIVE_GREAT_READS_AU]: brand[400],
  [Newsletters.SAVED_FOR_LATER_AU]: lifestyle[400],
};
