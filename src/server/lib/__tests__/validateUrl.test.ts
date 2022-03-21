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

  test('it should return default returnUrl if returnUrl parameter includes an invalid path', () => {
    const input = 'https://www.theguardian.com/signin';

    const output = validateReturnUrl(input);

    expect(output).toEqual(defaultReturnUri);
  });

  test('it should handle an native app redirect returnUrl - android live', () => {
    const input = 'com.theguardian:/authentication/callback';

    const output = validateReturnUrl(input);

    expect(output).toEqual(input);
  });

  test('it should remove an native app redirect returnUrl with query params  - android live', () => {
    const input = 'com.theguardian:/authentication/callback?foo=bar';

    const output = validateReturnUrl(input);

    const expected = 'com.theguardian:/authentication/callback';

    expect(output).toEqual(expected);
  });

  test('it should handle an native app redirect returnUrl - android live debug', () => {
    const input = 'com.theguardian.debug:/authentication/callback';

    const output = validateReturnUrl(input);

    expect(output).toEqual(input);
  });

  test('it should remove an native app redirect returnUrl with query params  - android live debug', () => {
    const input = 'com.theguardian.debug:/authentication/callback?foo=bar';

    const output = validateReturnUrl(input);

    const expected = 'com.theguardian.debug:/authentication/callback';

    expect(output).toEqual(expected);
  });

  test('it should handle an native app redirect returnUrl - iOS live', () => {
    const input = 'uk.co.guardian.iphone2:/authentication/callback';

    const output = validateReturnUrl(input);

    expect(output).toEqual(input);
  });

  test('it should remove an native app redirect returnUrl with query params  - iOS live', () => {
    const input = 'uk.co.guardian.iphone2:/authentication/callback?foo=bar';

    const output = validateReturnUrl(input);

    const expected = 'uk.co.guardian.iphone2:/authentication/callback';

    expect(output).toEqual(expected);
  });

  test('it should handle an native app redirect returnUrl - ios live debug', () => {
    const input = 'uk.co.guardian.iphone2.debug:/authentication/callback';

    const output = validateReturnUrl(input);

    expect(output).toEqual(input);
  });

  test('it should remove an native app redirect returnUrl with query params  - ios live debug', () => {
    const input =
      'uk.co.guardian.iphone2.debug:/authentication/callback?foo=bar';

    const output = validateReturnUrl(input);

    const expected = 'uk.co.guardian.iphone2.debug:/authentication/callback';

    expect(output).toEqual(expected);
  });

  test('it should return default returnUrl if app redirect is malformed', () => {
    const input1 = 'com.thegrauniad.live-app:/authentication/callback';
    const output1 = validateReturnUrl(input1);
    expect(output1).toEqual(defaultReturnUri);

    const input2 = 'com.theguardian:/auth/callback';
    const output2 = validateReturnUrl(input2);
    expect(output2).toEqual(defaultReturnUri);
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
