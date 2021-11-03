import { buildRegistrationUrlQueryParamString } from '@/client/pages/Registration';

describe('ibuildRegistrationUrlQueryParams', () => {
  it('returns a url parameter string with the optional values ', () => {
    expect(
      buildRegistrationUrlQueryParamString(
        'testReturnUrl',
        'refValue',
        'refViewId',
      ).toString(),
    ).toBe('returnUrl=testReturnUrl&ref=refValue&refViewId=refViewId');
    expect(
      buildRegistrationUrlQueryParamString(
        'testReturnUrl',
        undefined,
        'refViewId',
      ).toString(),
    ).toBe('returnUrl=testReturnUrl&refViewId=refViewId');
    expect(
      buildRegistrationUrlQueryParamString(
        undefined,
        undefined,
        'refViewId',
      ).toString(),
    ).toBe('refViewId=refViewId');
    expect(
      buildRegistrationUrlQueryParamString(
        undefined,
        undefined,
        undefined,
      ).toString(),
    ).toBe('');
  });
});
