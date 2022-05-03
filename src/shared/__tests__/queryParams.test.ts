import {
  addQueryParamsToPath,
  getPersistableQueryParams,
} from '@/shared/lib/queryParams';
import {
  QueryParams,
  PersistableQueryParams,
} from '@/shared/model/QueryParams';

describe('getPersistableQueryParams', () => {
  it('removes params that should not persist from the query object', () => {
    const input: QueryParams = {
      returnUrl: 'returnUrl',
      clientId: 'jobs',
      csrfError: true,
      recaptchaError: true,
      emailVerified: true,
      encryptedEmail: 'encryptedEmail',
      error: 'error',
      ref: 'ref',
      refViewId: 'refViewId',
      componentEventParams: 'componentEventParams',
      fromURI: 'fromURI',
      appClientId: 'appClientId',
    };

    const output = getPersistableQueryParams(input);

    const expected: PersistableQueryParams = {
      returnUrl: 'returnUrl',
      clientId: 'jobs',
      ref: 'ref',
      refViewId: 'refViewId',
      componentEventParams: 'componentEventParams',
      useOkta: undefined,
      fromURI: 'fromURI',
      appClientId: 'appClientId',
    };

    expect(output).toStrictEqual(expected);
  });
});

describe('addQueryParamsToPath', () => {
  it('adds persistable query params to path without preexisting querystring', () => {
    const input: QueryParams = {
      returnUrl: 'returnUrl',
      clientId: 'jobs',
      csrfError: true,
      recaptchaError: true,
      emailVerified: true,
      encryptedEmail: 'encryptedEmail',
      error: 'error',
      ref: 'ref',
      refViewId: 'refViewId',
      componentEventParams: 'componentEventParams',
    };

    const output = addQueryParamsToPath('/newsletters', input);

    expect(output).toEqual(
      '/newsletters?clientId=jobs&componentEventParams=componentEventParams&ref=ref&refViewId=refViewId&returnUrl=returnUrl',
    );
  });

  it('adds persistable query params to path without preexisting querystring, with manual override values', () => {
    const input: QueryParams = {
      returnUrl: 'returnUrl',
      clientId: 'jobs',
      csrfError: false,
      recaptchaError: false,
      emailVerified: true,
      encryptedEmail: 'encryptedEmail',
      error: 'error',
      ref: 'ref',
      refViewId: 'refViewId',
      componentEventParams: 'componentEventParams',
    };

    const inputOverride: Partial<QueryParams> = {
      csrfError: true,
      recaptchaError: true,
      encryptedEmail: 'an encrypted email',
    };

    const output = addQueryParamsToPath('/newsletters', input, inputOverride);

    expect(output).toEqual(
      '/newsletters?clientId=jobs&componentEventParams=componentEventParams&csrfError=true&encryptedEmail=an%20encrypted%20email&recaptchaError=true&ref=ref&refViewId=refViewId&returnUrl=returnUrl',
    );
  });
});
