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
  DOWN_TO_EARTH = '4147',
  MORNING_BRIEFING_AU = '4148',
  MORNING_BRIEFING_UK = '4156',
  MORNING_BRIEFING_US = '4300',
  THE_GUIDE = '6006',
  THE_LONG_READ = '4165',
}

export const ALL_NEWSLETTER_IDS = Object.values(Newsletters);
