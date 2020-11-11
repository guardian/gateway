import {
  parseExpressQueryParams,
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

      const output = parseExpressQueryParams('GET', input);

      expect(output).toEqual(input);
    });

    test('it returns query params with default returnUrl if returnUrl is not passed in', () => {
      const input = {};

      const expected = {
        returnUrl: defaultReturnUri,
      };

      const output = parseExpressQueryParams('GET', input);

      expect(output).toEqual(expected);
    });
  });

  describe('clientId', () => {
    test('it returns clientId in query params if valid', () => {
      const input = {
        clientId: 'jobs',
      };

      const output = parseExpressQueryParams('GET', input);

      expect(output).toEqual({ ...input, returnUrl: defaultReturnUri });
    });

    test('it returns undefined clientId in query params if not valid', () => {
      const input = {
        clientId: 'invalidClientId',
      };

      const output = parseExpressQueryParams('GET', input);

      expect(output).toEqual({ returnUrl: defaultReturnUri });
    });
  });

  describe('csrfError', () => {
    test('it should set csrfError param if set for GETs', () => {
      const input = {
        csrfError: 'true',
      };
      const output = parseExpressQueryParams('GET', input);
      expect(output.csrfError).toEqual(true);
    });
    test('it should not set csrfError param if not set for GETs', () => {
      const input = {};
      const output = parseExpressQueryParams('GET', input);
      expect(output.csrfError).toEqual(undefined);
    });
    test('it should not set csrfError param if set for POSTs', () => {
      const input = {};
      const output = parseExpressQueryParams('POST', input);
      expect(output.csrfError).toEqual(undefined);
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
