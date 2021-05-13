import { getGeolocationRegion } from '@/server/lib/getGeolocationRegion';
import { Request } from 'express';

const getFakeRequest = (region: string | undefined) => ({
  headers: {
    'x-gu-geolocation': region,
  },
});

describe('getGeolocationRegion', () => {
  [
    { input: 'GB', output: 'GB' },
    { input: 'US', output: 'US' },
    { input: 'AU', output: 'AU' },
    { input: 'FR', output: 'ROW' },
    { input: '', output: 'ROW' },
    { input: undefined, output: 'ROW' },
  ].forEach(({ input, output }) => {
    test(`given ${input} it returns ${output}`, () => {
      expect(
        getGeolocationRegion(getFakeRequest(input) as unknown as Request),
      ).toBe(output);
    });
  });
});
