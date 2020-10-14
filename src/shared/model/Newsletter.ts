import BOOKMARKS_IMAGE from '@/client/assets/4137.jpg';
import GREENLIGHT_IMAGE from '@/client/assets/4147.jpg';
import TODAYUK_IMAGE from '@/client/assets/4151.jpg';
import THELONGREAD_IMAGE from '@/client/assets/4165.jpg';

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
  TODAYUK = '4151',
  THELONGREAD = '4165',
}

export const NEWSLETTERS_PAGE: string[] = [
  Newsletters.TODAYUK,
  Newsletters.THELONGREAD,
  Newsletters.GREENLIGHT,
  Newsletters.BOOKMARKS,
];

export const NEWSLETTER_IMAGES = {
  [Newsletters.BOOKMARKS.toString()]: BOOKMARKS_IMAGE,
  [Newsletters.GREENLIGHT.toString()]: GREENLIGHT_IMAGE,
  [Newsletters.THELONGREAD.toString()]: THELONGREAD_IMAGE,
  [Newsletters.TODAYUK.toString()]: TODAYUK_IMAGE,
};
