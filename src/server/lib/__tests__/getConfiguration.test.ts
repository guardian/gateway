/* eslint-disable functional/immutable-data */
/* Linting rule disable as unit test needs to mutate env */
import type { Configuration } from '@/server/models/Configuration';
import {
  GA_UID,
  GA_UID_HASH,
  GU_DOMAIN,
  GU_API_DOMAIN,
} from '@/server/models/Configuration';

describe('getConfiguration', () => {
  const ORIGINAL_ENVIRONMENT_VARIABLES = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENVIRONMENT_VARIABLES };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENVIRONMENT_VARIABLES;
  });

  test('it returns the configuration object with the correct values', async () => {
    process.env.PORT = '9000';
    process.env.IDAPI_CLIENT_ACCESS_TOKEN = 'idapi_api_key';
    process.env.IDAPI_BASE_URL = 'http://localhost:1234';
    process.env.OAUTH_BASE_URL = 'http://localhost:5678';
    process.env.BASE_URI = 'base-uri';
    process.env.DEFAULT_RETURN_URI = 'default-return-uri';
    process.env.SIGN_IN_PAGE_URL = 'sign-in-page-url';
    process.env.STAGE = 'DEV';
    process.env.IS_HTTPS = 'true';
    process.env.APP_SECRET = 'app-secret';
    process.env.GOOGLE_RECAPTCHA_SITE_KEY = 'recaptcha-site';
    process.env.GOOGLE_RECAPTCHA_SECRET_KEY = 'recaptcha-secret';
    process.env.ENCRYPTION_SECRET_KEY =
      'f3d87b231ddd6f50d99e227c5bc9b7cbb649387b321008df412fd73805ac2e32';
    process.env.OKTA_ORG_URL = 'oktaorgurl';
    process.env.OKTA_API_TOKEN = 'oktatoken';
    process.env.OKTA_CUSTOM_OAUTH_SERVER = 'customoauthserverid';
    process.env.OKTA_CLIENT_ID = 'oktaclientid';
    process.env.OKTA_CLIENT_SECRET = 'oktaclientsecret';
    process.env.SENTRY_DSN = 'sentry-dsn';
    process.env.GITHUB_RUN_NUMBER = '5';
    process.env.REDIS_PASSWORD = 'redispassword';
    process.env.REDIS_HOST = 'localhost:1234';
    process.env.REDIS_SSL_ON = 'false';

    const rateLimiterConfig = `{
      "enabled": true,
      "debug": false,
      "defaultBuckets": {
        "globalBucket": { "capacity": 500, "addTokenMs": 50 },
        "ipBucket": { "capacity": 100, "addTokenMs": 50 },
        "emailBucket": { "capacity": 100, "addTokenMs": 50 },
        "oktaIdentifierBucket": { "capacity": 100, "addTokenMs": 50 },
        "accessTokenBucket": { "capacity": 100, "addTokenMs": 50 }
      },
      "routeBuckets": {
        "/signin": {
          "globalBucket": { "capacity": 500, "addTokenMs": 50 }
        }
      }
    }`;
    process.env.RATE_LIMITER_CONFIG = rateLimiterConfig;

    const { getConfiguration } = await import('@/server/lib/getConfiguration');

    const output = getConfiguration();

    const expected = {
      port: 9000,
      idapiClientAccessToken: 'idapi_api_key',
      idapiBaseUrl: 'http://localhost:1234',
      baseUri: 'base-uri',
      signInPageUrl: 'sign-in-page-url',
      defaultReturnUri: 'default-return-uri',
      stage: 'DEV',
      gaUID: {
        id: GA_UID.DEV,
        hash: GA_UID_HASH.DEV,
      },
      domain: GU_DOMAIN.DEV,
      apiDomain: GU_API_DOMAIN.DEV,
      isHttps: true,
      appSecret: 'app-secret',
      googleRecaptcha: {
        siteKey: 'recaptcha-site',
        secretKey: 'recaptcha-secret',
      },
      encryptionSecretKey:
        'f3d87b231ddd6f50d99e227c5bc9b7cbb649387b321008df412fd73805ac2e32',
      oauthBaseUrl: 'http://localhost:5678',
      okta: {
        enabled: true,
        orgUrl: 'oktaorgurl',
        token: 'oktatoken',
        authServerId: 'customoauthserverid',
        clientId: 'oktaclientid',
        clientSecret: 'oktaclientsecret',
      },
      aws: {
        kinesisStreamName: '',
        instanceId: '',
      },
      githubRunNumber: '5',
      sentryDsn: 'sentry-dsn',
      redis: {
        password: 'redispassword',
        host: 'localhost:1234',
        sslOn: false,
      },
      accountManagementUrl: 'https://manage.code.dev-theguardian.com',
      rateLimiter: {
        enabled: true,
        debug: false,
        defaultBuckets: {
          globalBucket: { capacity: 500, addTokenMs: 50 },
          ipBucket: { capacity: 100, addTokenMs: 50 },
          emailBucket: { capacity: 100, addTokenMs: 50 },
          oktaIdentifierBucket: { capacity: 100, addTokenMs: 50 },
          accessTokenBucket: { capacity: 100, addTokenMs: 50 },
        },
        routeBuckets: {
          '/signin': {
            globalBucket: { capacity: 500, addTokenMs: 50 },
          },
        },
      },
    } as Configuration;

    expect(output).toEqual(expected);
  });

  test('it throws an exception if the port is not set', async () => {
    process.env = {};
    const { getConfiguration } = await import('@/server/lib/getConfiguration');
    expect(() => getConfiguration()).toThrow();
  });

  test('it throws an exception if the rate limiter configuration is not set', async () => {
    // Mock fs so that the rate limiter won't fall back to a local config file.
    jest.mock('fs');

    process.env = { PORT: '9001' };

    const { getConfiguration } = await import('@/server/lib/getConfiguration');
    expect(getConfiguration).toThrowError(
      Error('Rate limiter configuration missing'),
    );
  });

  test('it throws an exception if a malformed rate limiter configuration is provided', async () => {
    // Missing the required globalBucket from the defaultBuckets
    const badRateLimiterConfig = `{
      "enabled": true,
      "debug": false,
      "defaultBuckets": { },
      "routeBuckets": {
        "/signin": {
          "globalBucket": { "capacity": 500, "addTokenMs": 50 }
        }
      }
    }`;
    process.env = { PORT: '9001', RATE_LIMITER_CONFIG: badRateLimiterConfig };

    const { getConfiguration } = await import('@/server/lib/getConfiguration');
    expect(getConfiguration).toThrowErrorMatchingInlineSnapshot(`
      "There was a problem parsing the rate limiter configuration [
        {
          code: 'invalid_type',
          expected: 'object',
          received: 'undefined',
          path: [ 'defaultBuckets', 'globalBucket' ],
          message: 'Required'
        }
      ]"
    `);
  });
});
