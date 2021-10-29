/**
 * @jest-environment jsdom
 */

import { buildRegistrationUrl } from '@/client/pages/Registration';

describe('ibuildRegistrationUrlQueryParams', () => {
  it('returns a url parameter string with the optional values ', () => {
    expect(
      buildRegistrationUrl(
        'testReturnUrl',
        'refValue',
        'refViewId',
      ).searchParams.toString(),
    ).toBe('returnUrl=testReturnUrl&ref=refValue&refViewId=refViewId');
    expect(
      buildRegistrationUrl(
        'testReturnUrl',
        undefined,
        'refViewId',
      ).searchParams.toString(),
    ).toBe('returnUrl=testReturnUrl&refViewId=refViewId');
    expect(
      buildRegistrationUrl(
        undefined,
        undefined,
        'refViewId',
      ).searchParams.toString(),
    ).toBe('refViewId=refViewId');
    expect(
      buildRegistrationUrl(
        undefined,
        undefined,
        undefined,
      ).searchParams.toString(),
    ).toBe('');
  });
});
