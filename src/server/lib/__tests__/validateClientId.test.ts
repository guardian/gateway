import { validateClientId } from '@/server/lib/validateClientId';

describe('validateClientId', () => {
  test('should return valid clientId', () => {
    const input = 'jobs';

    const output = validateClientId(input);

    expect(output).toEqual(input);
  });

  test('should return undefined if clientId not valid', () => {
    const input = 'notAValidClientId';

    const output = validateClientId(input);

    expect(output).toBeUndefined();
  });

  test('should return undefined if clientId not defined', () => {
    expect(validateClientId()).toBeUndefined();
  });
});
