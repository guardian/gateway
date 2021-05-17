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

export const ALL_NEWSLETTER_IDS = Object.values(Newsletters);
