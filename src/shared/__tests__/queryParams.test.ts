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
      clientId: 'clientId',
      csrfError: true,
      emailVerified: true,
      encryptedEmail: 'encryptedEmail',
      error: 'error',
      ref: 'ref',
      refViewId: 'refViewId',
    };

    const output = getPersistableQueryParams(input);

    const expected: PersistableQueryParams = {
      returnUrl: 'returnUrl',
      clientId: 'clientId',
      ref: 'ref',
      refViewId: 'refViewId',
    };

    expect(output).toStrictEqual(expected);
  });
});

describe('addQueryParamsToPath', () => {
  it('adds persistable query params to path without preexisting querystring', () => {
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

    const output = addQueryParamsToPath('/newsletters', input);

    expect(output).toEqual(
      '/newsletters?clientId=clientId&ref=ref&refViewId=refViewId&returnUrl=returnUrl',
    );
  });

  it('adds persistable query params to path without preexisting querystring, with manual override values', () => {
    const input: QueryParams = {
      returnUrl: 'returnUrl',
      clientId: 'clientId',
      csrfError: false,
      emailVerified: true,
      encryptedEmail: 'encryptedEmail',
      error: 'error',
      ref: 'ref',
      refViewId: 'refViewId',
    };

    const inputOverride: Partial<QueryParams> = {
      csrfError: true,
      encryptedEmail: 'an encrypted email',
    };

    const output = addQueryParamsToPath('/newsletters', input, inputOverride);

    expect(output).toEqual(
      '/newsletters?clientId=clientId&csrfError=true&encryptedEmail=an%20encrypted%20email&ref=ref&refViewId=refViewId&returnUrl=returnUrl',
    );
  });
});
