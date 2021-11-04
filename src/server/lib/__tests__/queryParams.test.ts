import {
  parseExpressQueryParams,
  addReturnUrlToPath,
  getSafeQueryParams,
  addQueryParamsToPath,
} from '@/server/lib/queryParams';
import { getConfiguration } from '@/server/lib/getConfiguration';
import {
  QueryParams,
  SafeQueryParams,
  UnsafeQueryParams,
} from '@/shared/model/QueryParams';

// mock configuration to return a default uri
jest.mock('@/server/lib/getConfiguration', () => ({
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

  describe('getSafeQueryParams', () => {
    it('removes unsafe properties from the query object', () => {
      const input: QueryParams = {
        returnUrl: 'returnUrl',
        clientId: 'clientId',
        csrfError: true,
        emailVerified: true,
        encryptedEmail: 'encryptedEmail',
        error: 'error',
        ref: 'ref',
        refViewId: 'refViewId',
      };

      const output = getSafeQueryParams(input);

      const expected: SafeQueryParams = {
        returnUrl: 'returnUrl',
        clientId: 'clientId',
        ref: 'ref',
        refViewId: 'refViewId',
      };

      expect(output).toStrictEqual(expected);
    });
  });

  describe('addQueryParamsToPath', () => {
    it('adds safe query params to path without preexisting querystring', () => {
      const input: QueryParams = {
        returnUrl: 'returnUrl',
        clientId: 'clientId',
        csrfError: true,
        emailVerified: true,
        encryptedEmail: 'encryptedEmail',
        error: 'error',
        ref: 'ref',
        refViewId: 'refViewId',
      };

      const output = addQueryParamsToPath('/test', input);

      expect(output).toEqual(
        '/test?clientId=clientId&ref=ref&refViewId=refViewId&returnUrl=returnUrl',
      );
    });

    it('adds safe query params to path with preexisting querystring', () => {
      const input: QueryParams = {
        returnUrl: 'returnUrl',
        clientId: 'clientId',
        csrfError: true,
        emailVerified: true,
        encryptedEmail: 'encryptedEmail',
        error: 'error',
        ref: 'ref',
        refViewId: 'refViewId',
      };

      const output = addQueryParamsToPath('/test?foo=bar', input);

      expect(output).toEqual(
        '/test?foo=bar&clientId=clientId&ref=ref&refViewId=refViewId&returnUrl=returnUrl',
      );
    });

    it('adds safe query params to path without preexisting querystring, with manual unsafe values', () => {
      const inputSafe: QueryParams = {
        returnUrl: 'returnUrl',
        clientId: 'clientId',
        csrfError: true,
        emailVerified: true,
        encryptedEmail: 'encryptedEmail',
        error: 'error',
        ref: 'ref',
        refViewId: 'refViewId',
      };

      const inputUnsafe: UnsafeQueryParams = {
        csrfError: true,
        encryptedEmail: 'an encrypted email',
      };

      const output = addQueryParamsToPath('/test', inputSafe, inputUnsafe);

      expect(output).toEqual(
        '/test?clientId=clientId&ref=ref&refViewId=refViewId&returnUrl=returnUrl&csrfError=true&encryptedEmail=an%20encrypted%20email',
      );
    });

    it('adds safe query params to path with preexisting querystring, with manual unsafe values', () => {
      const inputSafe: QueryParams = {
        returnUrl: 'returnUrl',
        clientId: 'clientId',
        csrfError: true,
        emailVerified: true,
        encryptedEmail: 'encryptedEmail',
        error: 'error',
        ref: 'ref',
        refViewId: 'refViewId',
      };

      const inputUnsafe: UnsafeQueryParams = {
        csrfError: true,
        encryptedEmail: 'an encrypted email',
      };

      const output = addQueryParamsToPath(
        '/test?foo=bar',
        inputSafe,
        inputUnsafe,
      );

      expect(output).toEqual(
        '/test?foo=bar&clientId=clientId&ref=ref&refViewId=refViewId&returnUrl=returnUrl&csrfError=true&encryptedEmail=an%20encrypted%20email',
      );
    });
  });
});
