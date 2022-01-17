import { removeEncryptedParam } from '../useRemoveEncryptedEmailParam';

describe('useRemoveEncryptedEmailParam', () => {
  it('deleted EcryptedEmail param from query string', () => {
    expect(removeEncryptedParam('abc=def&encryptedEmail=abc&test=def')).toBe(
      'abc=def&test=def',
    );
  });
});
