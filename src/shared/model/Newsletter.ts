export interface NewsLetter {
  id: string;
  description: string;
  frequency?: string;
  name: string;
}

export enum Newsletters {
  BOOKMARKS = 4137,
  GREENLIGHT = 4147,
  LABNOTES = 4153,
  THELONGREAD = 4165,
}
