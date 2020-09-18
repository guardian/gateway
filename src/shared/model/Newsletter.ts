export interface NewsLetter {
  id: string;
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
  LABNOTES = '4153',
  THELONGREAD = '4165',
}
