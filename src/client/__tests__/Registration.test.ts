import { buildRegistrationUrlQueryParams } from '@/client/pages/Registration';

describe('ibuildRegistrationUrlQueryParams', () => {
  it('returns a url parameter string with the optional values ', () => {
    expect(
      buildRegistrationUrlQueryParams('testReturnUrl', 'refValue', 'refViewId'),
    ).toBe('ref=refValue&refViewId=refViewId&returnUrl=testReturnUrl');
    expect(
      buildRegistrationUrlQueryParams('testReturnUrl', undefined, 'refViewId'),
    ).toBe('refViewId=refViewId&returnUrl=testReturnUrl');
    expect(
      buildRegistrationUrlQueryParams(undefined, undefined, 'refViewId'),
    ).toBe('refViewId=refViewId');
    expect(
      buildRegistrationUrlQueryParams(undefined, undefined, undefined),
    ).toBe('');
  });
});
