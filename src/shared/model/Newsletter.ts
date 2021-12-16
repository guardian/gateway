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

// TODO: alphabetize?
export enum Newsletters {
  BOOKMARKS = '4137',
  // TODO: rename to DOWN_TO_EARTH?
  GREENLIGHT = '4147',
  TODAY_UK = '4151',
  THE_LONG_READ = '4165',
  TODAY_US = '4152',
  TODAY_AU = '4150',
  MORNING_BRIEFING_UK = '4156',
  MORNING_BRIEFING_US = '4300',
  MORNING_BRIEFING_AU = '4148',
  MINUTE_US = '4166',
  THE_GUIDE = '6006',
  WORD_OF_MOUTH = '6002',
}

export const ALL_NEWSLETTER_IDS = Object.values(Newsletters);
