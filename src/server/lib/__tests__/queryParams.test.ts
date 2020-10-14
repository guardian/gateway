import {
  parseExpressQueryParams,
  appendQueryParameter,
  addReturnUrlToPath,
} from '@/server/lib/queryParams';
import { getConfiguration } from '@/server/lib/configuration';

// mock configuration to return a default uri
jest.mock('@/server/lib/configuration', () => ({
  getConfiguration: () => ({ defaultReturnUri: 'default-uri' }),
}));

describe('parseExpressQueryParams', () => {
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

describe('addReturnUrlToPath', () => {
  describe('when there are no existing parameters', () => {
    it('adds an encoded query parameter', () => {
      const input = '/test/path';
      const output = addReturnUrlToPath(input, 'a:// test');
      const expected = '/test/path?returnUrl=a%3A%2F%2F%20test';
      expect(output).toEqual(expected);
    });
  });

  describe('when there is a trailing slash', () => {
    it('adds an encoded query parameter after the trailing slash', () => {
      const input = '/test/path/';
      const output = addReturnUrlToPath(input, 'a:// test');
      const expected = '/test/path/?returnUrl=a%3A%2F%2F%20test';
      expect(output).toEqual(expected);
    });
  });

  describe('when there are existing parameters', () => {
    it('appends an encoded query parameter', () => {
      const input = '/test/path?otherParam=b%3A%2F%2Ftest+b';
      const output = addReturnUrlToPath(input, 'a:// test');
      const expected =
        '/test/path?otherParam=b%3A%2F%2Ftest+b&returnUrl=a%3A%2F%2F%20test';
      expect(output).toEqual(expected);
    });
  });
});

describe('appendQueryParameter', () => {
  describe('when there are no existing query parameters', () => {
    it('adds the encoded parameter as a new query string', () => {
      const input = 'https://profile.guardian.com/testurl';
      const output = appendQueryParameter(input, 'testParam', 'a:// test');
      const expected =
        'https://profile.guardian.com/testurl?testParam=a%3A%2F%2F+test';
      expect(output).toEqual(expected);
    });
  });
  describe('when there is a trailing slash', () => {
    it('adds the encoded parameter whilst retaining the trailing slash', () => {
      const input = 'https://profile.guardian.com/testurl/';
      const output = appendQueryParameter(input, 'testParam', 'a:// test');
      const expected =
        'https://profile.guardian.com/testurl/?testParam=a%3A%2F%2F+test';
      expect(output).toEqual(expected);
    });
  });
  describe('when there are existing query parameters', () => {
    it('appends the encoded parameter to the exisiting query string', () => {
      const input =
        'https://profile.guardian.com/testurl?otherParam=b%3A%2F%2Ftest+b';
      const output = appendQueryParameter(input, 'testParam', 'a:// test');
      const expected =
        'https://profile.guardian.com/testurl?otherParam=b%3A%2F%2Ftest+b&testParam=a%3A%2F%2F+test';
      expect(output).toEqual(expected);
    });
  });
});
