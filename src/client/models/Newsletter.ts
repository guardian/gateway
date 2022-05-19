import { Newsletters } from '@/shared/model/Newsletter';

import {
  DOWN_TO_EARTH_IMAGE,
  FIRST_EDITION_UK_IMAGE,
  MORNING_BRIEFING_AU_IMAGE,
  MORNING_BRIEFING_US_IMAGE,
  THE_GUIDE_IMAGE,
  THE_LONG_READ_IMAGE,
} from '@/client/assets/newsletters';

export const NEWSLETTER_IMAGES: Record<string, string> = {
  [Newsletters.DOWN_TO_EARTH]: DOWN_TO_EARTH_IMAGE,
  [Newsletters.FIRST_EDITION_UK]: FIRST_EDITION_UK_IMAGE,
  [Newsletters.MORNING_BRIEFING_AU]: MORNING_BRIEFING_AU_IMAGE,
  [Newsletters.MORNING_BRIEFING_US]: MORNING_BRIEFING_US_IMAGE,
  [Newsletters.THE_GUIDE]: THE_GUIDE_IMAGE,
  [Newsletters.THE_LONG_READ]: THE_LONG_READ_IMAGE,
};

export const NEWSLETTER_IMAGE_POSITIONS: Record<string, string> = {
  [Newsletters.FIRST_EDITION_UK]: 'bottom left',
};
