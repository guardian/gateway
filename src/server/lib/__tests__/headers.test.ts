import { ValidRoutePathsArray } from '@/shared/model/Routes';
import Redis from 'ioredis-mock';
import request from 'supertest';
import {
  defaultRateLimiterConfiguration,
  getServerInstance,
} from './sharedConfig';

// Override the default 5s max timeout for these tests because Supertest takes some time to run.
jest.setTimeout(10000);

/**
 * We mock a section of our app infrastruture so that the routes that Supertest
 * runs complete without throwing early errors. We're only testing the headers
 * we set in middleware here.
 */
jest.mock('@/server/lib/getAssets', () => ({
  getAssets: () => ({
    main: { js: 'mocked' },
    vendors: { js: 'mocked' },
    runtime: { js: 'mocked' },
  }),
}));
jest.mock('@/server/lib/serverSideLogger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('aws-sdk');
jest.mock('@/server/lib/getAssets', () => ({
  getAssets: () => ({
    main: { js: 'mocked' },
    vendors: { js: 'mocked' },
    runtime: { js: 'mocked' },
  }),
}));
jest.mock('@/server/lib/serverSideLogger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('@/server/lib/redis/redisClient', () => new Redis());
jest.mock('@/server/lib/middleware/login', () => ({
  loginMiddleware: jest.fn((req, res, next) => next()),
}));
jest.mock('@/server/lib/IDAPIFetch');

describe('Content Security Policy headers', () => {
  test.each(ValidRoutePathsArray)(
    'returns CSP headers for %s',
    async (route) => {
      const server = await getServerInstance(defaultRateLimiterConfiguration);
      const response = await request(server).get(route);
      // Dynamically import getConfiguration so the changes to the environment
      // variables are reflected inside the getConfiguration() call
      const { getConfiguration } = await import(
        '@/server/lib/getConfiguration'
      );
      const { baseUri, apiDomain } = getConfiguration();
      // Is the CSP header set?
      expect(response.header).toHaveProperty('content-security-policy');
      const splitCSPHeader =
        response.header['content-security-policy'].split(';');
      // Does the CSP header match what we expect it to be? If the CSP settings
      // in Helmet are updated, we expect to need to update these tests.
      expect(splitCSPHeader).toContain("base-uri 'none'");
      expect(splitCSPHeader).toContain("default-src 'none'");
      expect(splitCSPHeader).toContain(
        [
          'script-src',
          baseUri,
          "'sha256-411aj9j2RJj78RLGlCL/KDMK0fe6OEh8Vp6NzyYIkP4='",
          'www.google-analytics.com',
          'sourcepoint.theguardian.com',
          'gdpr-tcfv2.sp-prod.net',
          'ccpa.sp-prod.net',
          'ccpa-service.sp-prod.net',
          'ccpa-notice.sp-prod.net',
          'cdn.privacy-mgmt.com',
          'www.google.com',
          'www.gstatic.com',
          'assets.guim.co.uk',
          "'unsafe-eval'",
        ].join(' '),
      );
      expect(splitCSPHeader).toContain(
        `img-src ${baseUri} static.guim.co.uk ophan.theguardian.com www.google-analytics.com www.google.com`,
      );
      expect(splitCSPHeader).toContain('font-src assets.guim.co.uk');
      expect(splitCSPHeader).toContain(
        [
          'connect-src',
          'www.google-analytics.com',
          'vendorlist.consensu.org',
          `consent-logs.${apiDomain}`,
          'sourcepoint.theguardian.com',
          'gdpr-tcfv2.sp-prod.net',
          'ccpa.sp-prod.net',
          'ccpa-service.sp-prod.net',
          'ccpa-notice.sp-prod.net',
          'cdn.privacy-mgmt.com',
          'api.nextgen.guardianapps.co.uk',
          'https://api.pwnedpasswords.com',
          'localhost:1234',
          'www.google.com',
          'o14302.ingest.sentry.io',
        ].join(' '),
      );
      expect(splitCSPHeader).toContain('block-all-mixed-content');
      expect(splitCSPHeader).toContain("object-src 'none'");
      expect(splitCSPHeader).toContain("script-src-attr 'none'");
      expect(splitCSPHeader).toContain('upgrade-insecure-requests');

      // Is the STS header set?
      expect(response.header).toHaveProperty('strict-transport-security');
      expect(response.header['strict-transport-security']).toBe(
        'max-age=15552000; includeSubDomains',
      );
    },
  );
});