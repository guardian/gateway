import { removeQueryParam } from '../removeQueryParam';

describe('useRemoveEncryptedEmailParam', () => {
  it('deleted EcryptedEmail param from query string', () => {
    expect(
      removeQueryParam('abc=def&encryptedEmail=abc&test=def', 'encryptedEmail'),
    ).toBe('abc=def&test=def');
  });
});
