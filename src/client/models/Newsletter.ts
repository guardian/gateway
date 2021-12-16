import { Newsletters } from '@/shared/model/Newsletter';

import BOOKMARKS_IMAGE from '@/client/assets/4137.jpg';
import GREENLIGHT_IMAGE from '@/client/assets/4147.jpg';
import TODAY_UK_IMAGE from '@/client/assets/4151.jpg';
import TODAY_US_IMAGE from '@/client/assets/4152.jpg';
import TODAY_AU_IMAGE from '@/client/assets/4150.jpg';
import THE_LONG_READ_IMAGE from '@/client/assets/4165.jpg';
import MORNING_BRIEFING_US_IMAGE from '@/client/assets/4300.jpg';
import MINUTE_US_IMAGE from '@/client/assets/4166.jpg';

export const NEWSLETTER_IMAGES = {
  [Newsletters.BOOKMARKS.toString()]: BOOKMARKS_IMAGE,
  [Newsletters.GREENLIGHT.toString()]: GREENLIGHT_IMAGE,
  [Newsletters.THE_LONG_READ.toString()]: THE_LONG_READ_IMAGE,
  [Newsletters.TODAY_UK.toString()]: TODAY_UK_IMAGE,
  [Newsletters.TODAY_US.toString()]: TODAY_US_IMAGE,
  [Newsletters.TODAY_AU.toString()]: TODAY_AU_IMAGE,
  [Newsletters.MORNING_BRIEFING_US.toString()]: MORNING_BRIEFING_US_IMAGE,
  [Newsletters.MINUTE_US.toString()]: MINUTE_US_IMAGE,
};
