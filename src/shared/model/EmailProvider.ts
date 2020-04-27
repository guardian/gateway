export interface EmailProvider {
  id: string;
  name: string;
  inboxLink: string;
  matches: string[];
}
