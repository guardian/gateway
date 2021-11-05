import {
  addQueryParamsToPath,
  getSafeQueryParams,
} from '@/shared/lib/queryParams';
import {
  QueryParams,
  SafeQueryParams,
  UnsafeQueryParams,
} from '@/shared/model/QueryParams';

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
