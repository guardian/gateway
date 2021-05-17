import { ALL_NEWSLETTER_IDS } from '@/shared/model/Newsletter';
import { newslettersSubscriptionsFromFormBody } from '@/shared/lib/newsletter';

describe('newsletter', () => {
  describe('newslettersSubscriptionsFromFormBody', () => {
    test('it parses body correctly for single newsletter checkbox that has been checked', () => {
      const newsletterId = ALL_NEWSLETTER_IDS[0];

      const input = {
        [newsletterId]: ['', newsletterId],
        other: 'key',
      };

      const output = newslettersSubscriptionsFromFormBody(input);

      const expected = [{ id: newsletterId, subscribed: true }];

      expect(output).toEqual(expected);
    });

    test('it parses body correctly for single newsletter checkbox that has been unchecked', () => {
      const newsletterId = ALL_NEWSLETTER_IDS[0];

      const input = {
        [newsletterId]: '',
        other: 'key',
      };

      const output = newslettersSubscriptionsFromFormBody(input);

      const expected = [{ id: newsletterId, subscribed: false }];

      expect(output).toEqual(expected);
    });

    test('it parses body correctly for multiple newsletters checkbox that have been checked', () => {
      const newsletterId0 = ALL_NEWSLETTER_IDS[0];
      const newsletterId1 = ALL_NEWSLETTER_IDS[1];

      const input = {
        [newsletterId0]: ['', newsletterId0],
        [newsletterId1]: ['', newsletterId1],
        other: 'key',
      };

      const output = newslettersSubscriptionsFromFormBody(input);

      const expected = [
        { id: newsletterId0, subscribed: true },
        { id: newsletterId1, subscribed: true },
      ];

      expect(output).toEqual(expected);
    });

    test('it parses body correctly for multiple newsletters checkbox that have been unchecked', () => {
      const newsletterId0 = ALL_NEWSLETTER_IDS[0];
      const newsletterId1 = ALL_NEWSLETTER_IDS[1];

      const input = {
        [newsletterId0]: '',
        [newsletterId1]: '',
        other: 'key',
      };

      const output = newslettersSubscriptionsFromFormBody(input);

      const expected = [
        { id: newsletterId0, subscribed: false },
        { id: newsletterId1, subscribed: false },
      ];

      expect(output).toEqual(expected);
    });

    test('it parses body correctly for multiple newsletters checkbox that have been mixed', () => {
      const newsletterId0 = ALL_NEWSLETTER_IDS[0];
      const newsletterId1 = ALL_NEWSLETTER_IDS[1];

      const input = {
        [newsletterId0]: ['', newsletterId0],
        [newsletterId1]: '',
        other: 'key',
      };

      const output = newslettersSubscriptionsFromFormBody(input);

      const expected = [
        { id: newsletterId0, subscribed: true },
        { id: newsletterId1, subscribed: false },
      ];

      expect(output).toEqual(expected);
    });

    test('returns an empty array if no newsletters passed in body', () => {
      const input = {
        other: 'key',
      };

      const output = newslettersSubscriptionsFromFormBody(input);

      const expected: unknown[] = [];

      expect(output).toEqual(expected);
    });

    test('returns an empty array if empty body', () => {
      const input = {};

      const output = newslettersSubscriptionsFromFormBody(input);

      const expected: unknown[] = [];

      expect(output).toEqual(expected);
    });

    test('returns an empty array if invalid newsletter id passed in body', () => {
      const input = {
        '9999': ['', '9999'],
        other: 'key',
      };

      const output = newslettersSubscriptionsFromFormBody(input);

      const expected: unknown[] = [];

      expect(output).toEqual(expected);
    });
  });
});
