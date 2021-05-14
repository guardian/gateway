import BOOKMARKS_IMAGE from '@/client/assets/4137.jpg';
import GREENLIGHT_IMAGE from '@/client/assets/4147.jpg';
import TODAY_UK_IMAGE from '@/client/assets/4151.jpg';
import TODAY_US_IMAGE from '@/client/assets/4152.jpg';
import TODAY_AU_IMAGE from '@/client/assets/4150.jpg';
import THE_LONG_READ_IMAGE from '@/client/assets/4165.jpg';
import US_MORNING_BRIEFING_IMAGE from '@/client/assets/4300.jpg';
import MINUTE_US_IMAGE from '@/client/assets/4166.jpg';

export interface NewsLetter {
  id: string;
  nameId: string;
  description: string;
  frequency?: string;
  name: string;
  subscribed?: boolean;
}

export interface NewsletterPatch {
  id: string;
  subscribed: boolean;
}

export enum Newsletters {
  BOOKMARKS = '4137',
  GREENLIGHT = '4147',
  TODAY_UK = '4151',
  THE_LONG_READ = '4165',
  TODAY_US = '4152',
  TODAY_AU = '4150',
  US_MORNING_BRIEFING = '4300',
  MINUTE_US = '4166',
}

export const NEWSLETTER_IMAGES = {
  [Newsletters.BOOKMARKS.toString()]: BOOKMARKS_IMAGE,
  [Newsletters.GREENLIGHT.toString()]: GREENLIGHT_IMAGE,
  [Newsletters.THE_LONG_READ.toString()]: THE_LONG_READ_IMAGE,
  [Newsletters.TODAY_UK.toString()]: TODAY_UK_IMAGE,
  [Newsletters.TODAY_US.toString()]: TODAY_US_IMAGE,
  [Newsletters.TODAY_AU.toString()]: TODAY_AU_IMAGE,
  [Newsletters.US_MORNING_BRIEFING.toString()]: US_MORNING_BRIEFING_IMAGE,
  [Newsletters.MINUTE_US.toString()]: MINUTE_US_IMAGE,
};

export const ALL_NEWSLETTER_IDS = Object.values(Newsletters);
