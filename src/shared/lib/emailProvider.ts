import { EmailProvider } from '@/shared/model/EmailProvider';

const emailProviders: EmailProvider[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    inboxLink: 'https://mail.google.com/mail',
    matches: ['@gmail.', '@googlemail.', '@guardian.', '@theguardian.'],
  },
  {
    id: 'yahoo',
    name: 'Yahoo!',
    inboxLink: 'https://mail.yahoo.com',
    matches: ['@yahoo.', '@yahoomail.'],
  },
  {
    id: 'bt',
    name: 'BT Mail',
    inboxLink: 'https://www.bt.com/email',
    matches: ['@btinternet.'],
  },
  {
    id: 'aol',
    name: 'AOL Mail',
    matches: ['@aol.'],
    inboxLink: 'https://mail.aol.com/',
  },
  {
    id: 'outlook',
    name: 'Outlook',
    matches: ['@outlook.', '@live.', '@msn.', '@hotmail.'],
    inboxLink: 'https://outlook.live.com/',
  },
];

export const getProviderById: (id?: string) => EmailProvider | undefined = id =>
  emailProviders.find(ep => ep.id === id);

export const getProviderForEmail: (
  email: string,
) => EmailProvider | undefined = email =>
  emailProviders.find(ep => ep.matches.some(m => email.includes(m)));
