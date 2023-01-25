import { Request } from 'express';
import { getABForcedVariants } from '@/server/lib/getABForcedVariants';

describe('getABForcedVariants', () => {
  describe('when there are variants', () => {
    it('returns the variants stripped of their ab- prefix', () => {
      const request = {
        query: {
          'ab-test1': 'testparameter1',
          'ab-test2': 'testparameter2',
        },
      } as unknown as Request;
      const expected = {
        test1: {
          variant: 'testparameter1',
        },
        test2: {
          variant: 'testparameter2',
        },
      };
      const output = getABForcedVariants(request);
      expect(output).toStrictEqual(expected);
    });
  });
  describe('when there are multiple variants of the same key', () => {
    it('only uses the latest query in the string', () => {
      const request = {
        query: {
          'ab-test3': ['testparameter3', 'testparameter4'],
        },
      } as unknown as Request;
      const expected = {
        test3: {
          variant: 'testparameter4',
        },
      };
      const output = getABForcedVariants(request);
      expect(output).toStrictEqual(expected);
    });
  });
  describe('when there are no variants', () => {
    it('returns an empty varients object', () => {
      const request = { query: {} } as unknown as Request;
      const expected = {};
      const output = getABForcedVariants(request);
      expect(output).toStrictEqual(expected);
    });
  });
});
