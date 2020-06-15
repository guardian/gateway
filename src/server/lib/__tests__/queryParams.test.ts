import { parseExpressQueryParams } from '@/server/lib/queryParams';
import { getConfiguration } from '@/server/lib/configuration';

// mock configuration to return a default uri
jest.mock('@/server/lib/configuration', () => ({
  getConfiguration: () => ({ defaultReturnUri: 'default-uri' }),
}));

describe('queryParams', () => {
  const { defaultReturnUri } = getConfiguration();

  describe('returnUrl', () => {
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
  });

  describe('clientId', () => {
    test('it returns clientId in query params if valid', () => {
      const input = {
        clientId: 'jobs',
      };

      const output = parseExpressQueryParams(input);

      expect(output).toEqual({ ...input, returnUrl: defaultReturnUri });
    });

    test('it returns undefined clientId in query params if not valid', () => {
      const input = {
        clientId: 'invalidClientId',
      };

      const output = parseExpressQueryParams(input);

      expect(output).toEqual({ returnUrl: defaultReturnUri });
    });
  });
});
