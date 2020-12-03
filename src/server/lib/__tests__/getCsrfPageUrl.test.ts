import { Request } from 'express';
import { getCsrfPageUrl } from '@/server/lib/getCsrfPageUrl';

const fakeRequest = (method: string, csrfSubmitted = true) => ({
  url: 'standardRequestUrl',
  method,
  ...(csrfSubmitted && {
    body: {
      _csrfPageUrl: 'csrfPageURLValue',
    },
  }),
});

describe('getCsrfPageUrl', () => {
  describe('when the request method is not a protected method', () => {
    it('returns the request url', () => {
      const input = (fakeRequest('GET') as unknown) as Request;
      const expected = 'standardRequestUrl';
      const output = getCsrfPageUrl(input);
      expect(output).toBe(expected);
    });
  });
  ['POST', 'PATCH', 'PUT', 'DELETE'].forEach((method) => {
    describe(`when the request is the protected method ${method}`, () => {
      describe('and the csrfPageUrl has been submitted', () => {
        it('returns the csrfPageUrl', () => {
          const input = (fakeRequest(method) as unknown) as Request;
          const expected = 'csrfPageURLValue';
          const output = getCsrfPageUrl(input);
          expect(output).toBe(expected);
        });
      });
      describe('and the csrfPageUrl has not been submitted', () => {
        it('returns the request url', () => {
          const input = (fakeRequest(method, false) as unknown) as Request;
          const expected = 'standardRequestUrl';
          const output = getCsrfPageUrl(input);
          expect(output).toBe(expected);
        });
      });
    });
  });
});
