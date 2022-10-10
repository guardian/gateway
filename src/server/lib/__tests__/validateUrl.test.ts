import { getConfiguration } from '@/server/lib/getConfiguration';
import { validateReturnUrl, validateRefUrl } from '@/server/lib/validateUrl';

// mock configuration to return a default uri
jest.mock('@/server/lib/getConfiguration', () => ({
  getConfiguration: () => ({ defaultReturnUri: 'default-uri' }),
}));

describe('validateReturnUrl', () => {
  const { defaultReturnUri } = getConfiguration();

  test('it should successfully validate returnUrl', () => {
    const input =
      'https://www.theguardian.com/games/2020/mar/16/animal-crossing-new-horizons-review-nintendo-switch';

    const output = validateReturnUrl(input);

    expect(output).toEqual(input);
  });

  test('it should return default returnUrl if returnUrl parameter is blank', () => {
    expect(validateReturnUrl()).toEqual(defaultReturnUri);
    expect(validateReturnUrl('')).toEqual(defaultReturnUri);
  });

  test('it should return default returnUrl if the returnUrl parameter includes an invalid hostname', () => {
    const input = 'https://example.com/example/path';

    const output = validateReturnUrl(input);

    expect(output).toEqual(defaultReturnUri);
  });

  test('it should return default returnUrl if returnUrl parameter includes an invalid path, and is on profile subdomain', () => {
    const input = 'https://profile.theguardian.com/signout';

    const output = validateReturnUrl(input);

    expect(output).toEqual(defaultReturnUri);
  });

  test('it should return returnUrl with query parameters if on profile subdomain', () => {
    const input = 'https://profile.theguardian.com/signin?clientId=jobs';

    const output = validateReturnUrl(input);

    expect(output).toEqual(input);
  });
});

describe('validateRefUrl', () => {
  test('it should successfully validate refUrl', () => {
    const input =
      'https://www.theguardian.com/games/2020/mar/16/animal-crossing-new-horizons-review-nintendo-switch';

    const output = validateRefUrl(input);

    expect(output).toEqual(input);
  });

  test('it should successfully validate refUrl on profile path', () => {
    const input = 'https://profile.theguardian.com/signin/register';

    const output = validateRefUrl(input);

    expect(output).toEqual(input);
  });

  test('it should return undefined if refUrl parameter is blank', () => {
    expect(validateRefUrl()).toEqual(undefined);
    expect(validateRefUrl('')).toEqual(undefined);
  });

  test('it should return undefined if the refUrl parameter includes an invalid hostname', () => {
    const input = 'https://example.com/example/path';

    const output = validateRefUrl(input);

    expect(output).toEqual(undefined);
  });
});
