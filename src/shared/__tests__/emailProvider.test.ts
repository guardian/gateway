import {
  getProviderById,
  getProviderForEmail,
} from '@/shared/lib/emailProvider';
import { EmailProvider } from '@/shared/model/EmailProvider';

describe('emailProvider', () => {
  const gmailExpected: EmailProvider = {
    id: 'gmail',
    name: 'Gmail',
    inboxLink: 'https://mail.google.com/mail',
    matches: ['@gmail.', '@googlemail.'],
  };

  const outlookExpected: EmailProvider = {
    id: 'outlook',
    name: 'Outlook',
    matches: ['@outlook.', '@live.', '@msn.', '@hotmail.'],
    inboxLink: 'https://outlook.live.com/',
  };

  describe('getProviderById', () => {
    test('it returns the correct email provider for gmail', () => {
      const id = 'gmail';
      const output = getProviderById(id);

      const expected = gmailExpected;

      expect(output).toEqual(expected);
    });

    test('it returns the correct email provider for outlook', () => {
      const id = 'outlook';
      const output = getProviderById(id);

      const expected = outlookExpected;

      expect(output).toEqual(expected);
    });

    test('it returns undefined if the id parameter not for a valid email provider', () => {
      const id = 'invalid';
      const output = getProviderById(id);

      expect(output).toBeUndefined();
    });

    test('it returns undefined if the id parameter is not defined', () => {
      const output = getProviderById();

      expect(output).toBeUndefined();
    });
  });

  describe('getProviderForEmail', () => {
    test('it returns gmail email provider for a gmail email', () => {
      const email = 'example@gmail.com';

      const output = getProviderForEmail(email);

      const expected = gmailExpected;

      expect(output).toEqual(expected);
    });

    test('it returns gmail email provider for a googlemail email', () => {
      const email = 'example@googlemail.com';

      const output = getProviderForEmail(email);

      const expected = gmailExpected;

      expect(output).toEqual(expected);
    });

    test('it returns outlook email provider for a msn email', () => {
      const email = 'example@msn.com';

      const output = getProviderForEmail(email);

      const expected = outlookExpected;

      expect(output).toEqual(expected);
    });

    test('it returns undefined if email not from valid email provider', () => {
      const email = 'example@example.com';

      const output = getProviderForEmail(email);

      expect(output).toBeUndefined();
    });

    test('it returns undefined if email is not a valid email string', () => {
      const email = 'malformed-email';

      const output = getProviderForEmail(email);

      expect(output).toBeUndefined();
    });
  });
});
