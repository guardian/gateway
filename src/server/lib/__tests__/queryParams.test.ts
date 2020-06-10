import { parseExpressQueryParams } from '@/server/lib/queryParams';
import { getConfiguration } from '@/server/lib/configuration';

// mock configuration to return a default uri
jest.mock('@/server/lib/configuration', () => ({
  getConfiguration: () => ({ defaultReturnUri: 'default-uri' }),
}));

describe('queryParams', () => {
  describe('returnUrl', () => {
    const { defaultReturnUri } = getConfiguration();

    test('it returns query params when returnUrl is passed in', () => {
      const input = {
        returnUrl:
          'https://www.theguardian.com/games/2020/mar/16/animal-crossing-new-horizons-review-nintendo-switch',
      };

      const output = parseExpressQueryParams(input);

      expect(output).toEqual(input);
    });

    test('it returns query params with default returnUrl if returnUrl is not passed in', () => {
      const input = {};

      const expected = {
        returnUrl: defaultReturnUri,
      };

      const output = parseExpressQueryParams(input);

      expect(output).toEqual(expected);
    });

    test('it returns query params with with default returnUrl if the passed in returnUrl includes an invalid hostname', () => {
      const input = {
        returnUrl: 'https://example.com/example/path',
      };

      const expected = {
        returnUrl: defaultReturnUri,
      };

      const output = parseExpressQueryParams(input);

      expect(output).toEqual(expected);
    });

    test('it returns query params with default returnUrl if the passed in returnUrl includes an invalid path', () => {
      const input = {
        returnUrl: 'https://www.theguardian.com/signin',
      };

      const expected = {
        returnUrl: defaultReturnUri,
      };

      const output = parseExpressQueryParams(input);

      expect(output).toEqual(expected);
    });
  });
});
