import { Request } from 'express';
import { getRegistrationLocation } from '../getRegistrationLocation';

const getFakeRequest = (country: string | undefined) => ({
  cookies: {
    GU_geo_country: country,
  },
});

describe('getRegistrationLocation', () => {
  test(`returns undefined if cmp consent state is false `, () => {
    expect(
      getRegistrationLocation(getFakeRequest('GB') as Request, false),
    ).toBe(undefined);
  });

  test(`returns undefined if cmp consent state is undefined `, () => {
    expect(
      getRegistrationLocation(getFakeRequest('GB') as Request, undefined),
    ).toBe(undefined);
  });

  [
    { input: 'GB', output: 'United Kingdom' },
    { input: 'US', output: 'United States' },
    { input: 'AU', output: 'Australia' },
    { input: 'CA', output: 'Canada' },
    { input: 'NZ', output: 'New Zealand' },
    { input: 'FR', output: 'Europe' },
    { input: 'SA', output: 'Other' },
    { input: undefined, output: undefined },
    { input: '', output: undefined },
    { input: 'foobar', output: undefined },
  ].forEach(({ input, output }) => {
    test(`given ${input} , and the cmp consent state is true, it returns ${output}`, () => {
      expect(
        getRegistrationLocation(getFakeRequest(input) as Request, true),
      ).toBe(output);
    });
  });
});
