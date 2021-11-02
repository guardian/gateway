import { removeEcryptedParam } from './useRemoveEncryptedEmailParam';

describe('useRemoveEncryptedEmailParam', () => {
  it('deleted EcryptedEmail param from query string', () => {
    expect(removeEcryptedParam('abc=def&encryptedEmail=abc&test=def')).toBe(
      'abc=def&test=def',
    );
  });
});
