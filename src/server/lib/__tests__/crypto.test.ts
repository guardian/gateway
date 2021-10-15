import crypto from 'crypto';
import { mocked } from 'ts-jest/utils';
import { Configuration } from '@/server/models/Configuration';
import { decrypt, encrypt } from '../crypto';
import { getConfiguration } from '../getConfiguration';

jest.mock('@/server/lib/getConfiguration', () => ({
  getConfiguration: jest.fn(),
}));

const mockedGetConfiguration =
  mocked<() => Partial<Configuration>>(getConfiguration);

describe('crypto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetConfiguration.mockReturnValue({
      encryptionSecretKey:
        'f3d87b231ddd6f50d99e227c5bc9b7cbb649387b321008df412fd73805ac2e32',
    });
  });

  test('it should successfully encrypt and decrypt the initial message', () => {
    const input = 'The quick brown fox jumps over the lazy dog.';

    const encrypted = encrypt(input);

    const decrypted = decrypt(encrypted);

    expect(decrypted).toEqual(input);
  });

  test('it should fail if the encryption secret key is not valid', () => {
    mockedGetConfiguration.mockReturnValueOnce({
      encryptionSecretKey: 'f3d87b231',
    });

    const input = 'The quick brown fox jumps over the lazy dog.';

    expect(() => encrypt(input)).toThrow('Invalid key length');
  });

  test('it should fail decryption if the encryption secret key is not valid', () => {
    mockedGetConfiguration
      .mockReturnValueOnce({
        encryptionSecretKey:
          'f3d87b231ddd6f50d99e227c5bc9b7cbb649387b321008df412fd73805ac2e32',
      })
      .mockReturnValueOnce({
        encryptionSecretKey: 'f3d87b231',
      });

    const input = 'The quick brown fox jumps over the lazy dog.';

    const encrypted = encrypt(input);

    expect(() => decrypt(encrypted)).toThrow('Invalid key length');
  });

  test('it should fail decryption if the encrypted string is invalid/malformed', () => {
    expect(() => decrypt('malformed-string.123.456')).toThrow();
    expect(() => decrypt('malformed-string.123')).toThrow();
    expect(() => decrypt('malformed-string')).toThrow();
  });

  test('it should fail decryption if the iv is invalid/modified', () => {
    const input = 'The quick brown fox jumps over the lazy dog.';

    const encrypted = encrypt(input);

    const split = encrypted.split('.');

    // eslint-disable-next-line functional/immutable-data
    split[0] = crypto.randomBytes(12).toString('base64');

    expect(() => decrypt(split.join('.'))).toThrow(
      'Unsupported state or unable to authenticate data',
    );
  });

  test('it should fail decryption if the auth tag is invalid/modified', () => {
    const input = 'The quick brown fox jumps over the lazy dog.';

    const encrypted = encrypt(input);

    const split = encrypted.split('.');

    // eslint-disable-next-line functional/immutable-data
    split[1] = crypto.randomBytes(16).toString('base64');

    expect(() => decrypt(split.join('.'))).toThrow(
      'Unsupported state or unable to authenticate data',
    );
  });

  test('it should fail decryption if the cipher text has been modified', () => {
    const input = 'The quick brown fox jumps over the lazy dog.';

    const encrypted = encrypt(input);

    const split = encrypted.split('.');

    // eslint-disable-next-line functional/immutable-data
    split[2] = crypto.randomBytes(16).toString('base64');

    expect(() => decrypt(split.join('.'))).toThrow(
      'Unsupported state or unable to authenticate data',
    );
  });

  test('multiple encrypted values should produce different results', () => {
    const input = 'The quick brown fox jumps over the lazy dog.';

    const encrypted1 = encrypt(input);
    const encrypted2 = encrypt(input);

    const decrypted1 = decrypt(encrypted1);
    const decrypted2 = decrypt(encrypted2);

    expect(encrypted1).not.toEqual(encrypted2);
    expect(encrypted1.split('.')[2]).not.toEqual(encrypted2.split('.')[2]);
    expect(decrypted1).toEqual(decrypted2);
    expect(decrypted1).toEqual(input);
  });
});
