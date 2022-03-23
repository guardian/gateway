import Redis from 'ioredis-mock';
import { default as request } from 'supertest';
import { RequestHandler } from 'express';
import { RateLimiterConfiguration } from '../../rate-limit';

const defaultEnv = {
  PORT: '9000',
  IDAPI_CLIENT_ACCESS_TOKEN: 'idapi_api_key',
  IDAPI_BASE_URL: 'http://localhost:1234',
  OAUTH_BASE_URL: 'http://localhost:5678',
  BASE_URI: 'base-uri',
  DEFAULT_RETURN_URI: 'default-return-uri',
  SIGN_IN_PAGE_URL: 'sign-in-page-url',
  STAGE: 'DEV',
  IS_HTTPS: 'true',
  APP_SECRET: 'app-secret',
  GOOGLE_RECAPTCHA_SITE_KEY: 'recaptcha-site',
  GOOGLE_RECAPTCHA_SECRET_KEY: 'recaptcha-secret',
  ENCRYPTION_SECRET_KEY:
    'f3d87b231ddd6f50d99e227c5bc9b7cbb649387b321008df412fd73805ac2e32',
  OKTA_ORG_URL: 'oktaorgurl',
  OKTA_API_TOKEN: 'oktatoken',
  OKTA_CUSTOM_OAUTH_SERVER: 'customoauthserverid',
  OKTA_CLIENT_ID: 'oktaclientid',
  OKTA_CLIENT_SECRET: 'oktaclientsecret',
  SENTRY_DSN: 'sentry-dsn',
  GITHUB_RUN_NUMBER: '5',
  REDIS_PASSWORD: 'redispassword',
  REDIS_HOST: 'localhost:1234',
};

describe('rate limiter middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    jest.mock('@/server/lib/getAssets', () => ({
      getAssets: () => ({
        main: { js: 'mocked' },
        vendors: { js: 'mocked' },
        runtime: { js: 'mocked' },
      }),
    }));

    jest.mock('aws-sdk');
    jest.mock('@/server/lib/idapi/user');
    jest.mock('@/server/lib/idapi/guest');
    jest.mock('@/server/lib/idapi/decryptToken');
    jest.mock('@/server/lib/idapi/auth', () => ({
      authenticate: async () => ({
        values: [],
      }),
    }));
    jest.mock('@/server/lib/idapi/IDAPICookies');
    jest.mock('@/server/lib/trackMetric');
    jest.mock('@/server/lib/serverSideLogger');

    jest.mock(
      'csurf',
      () => (): RequestHandler => (req, res, next) => {
        // eslint-disable-next-line functional/immutable-data
        req.csrfToken = jest.fn().mockReturnValue('');
        next();
      },
    );

    jest.mock('@/server/lib/recaptcha', () =>
      jest.fn((req, res, next) => {
        // eslint-disable-next-line functional/immutable-data
        req.recaptcha = { error: false };
        next();
      }),
    );

    jest.mock('@/server/lib/redis/redisClient', () => new Redis());
  });

  afterEach((done) => {
    // in-memory redis store is persisted after each run
    // make sure to clear the store after each test
    new Redis().flushall().then(() => done());
  });

  const getServerInstance = async (
    rateLimiterConfig: RateLimiterConfiguration,
  ) => {
    // eslint-disable-next-line functional/immutable-data
    process.env = {
      ...defaultEnv,
      RATE_LIMITER_CONFIG: JSON.stringify(rateLimiterConfig),
    };

    // Start the application server.
    const { default: server } = await import('@/server/index');

    const handle = setTimeout(() => {
      if (server.listening) {
        server.close();
      }
    }, 14000);

    const done = async () => {
      clearTimeout(handle);
      await new Promise((r) => server.close(r));
    };

    return { server, done };
  };

  it('should rate limit all clients when the global bucket is empty', async () => {
    const rateLimiterConfig = {
      enabled: true,
      defaultBuckets: {
        globalBucket: { capacity: 2, addTokenMs: 500 },
      },
    } as RateLimiterConfiguration;

    const { server, done } = await getServerInstance(rateLimiterConfig);

    // Consume both global tokens, expect third request to be limited.
    await request(server).get('/register').expect(200);
    await request(server).get('/register').expect(200);
    await request(server).get('/register').expect(429);

    await new Promise((r) => setTimeout(r, 500));

    // After 100ms, user can make a request again.
    await request(server).get('/register').expect(200);

    await done();
  });

  it('should rate limit when the ip rate limit bucket is empty', async () => {
    const rateLimiterConfig = {
      enabled: true,
      defaultBuckets: {
        globalBucket: { capacity: 10, addTokenMs: 500 },
        ipBucket: { capacity: 2, addTokenMs: 500 },
      },
    } as RateLimiterConfiguration;

    // Start the application server.
    const { server, done } = await getServerInstance(rateLimiterConfig);

    // After two requests, 192.168.2.1 should hit the rate limit.
    await request(server)
      .get('/register')
      .set('X-Forwarded-For', '192.168.2.1')
      .expect(200);
    await request(server)
      .get('/register')
      .set('X-Forwarded-For', '192.168.2.1')
      .expect(200);
    await request(server)
      .get('/register')
      .set('X-Forwarded-For', '192.168.2.1')
      .expect(429);

    // 192.168.2.7 should be allowed to make a request.
    await request(server)
      .get('/register')
      .set('X-Forwarded-For', '192.168.2.7')
      .expect(200);

    await new Promise((r) => setTimeout(r, 500));

    // After 100ms 192.168.2.1 can make a request again.
    await request(server)
      .get('/register')
      .set('X-Forwarded-For', '192.168.2.1')
      .expect(200);

    await done();
  });

  it('should rate limit when the access token bucket is empty', async () => {
    const rateLimiterConfig = {
      enabled: true,
      defaultBuckets: {
        globalBucket: { capacity: 10, addTokenMs: 500 },
        accessTokenBucket: { capacity: 2, addTokenMs: 500 },
      },
    } as RateLimiterConfiguration;

    // Start the application server.
    const { server, done } = await getServerInstance(rateLimiterConfig);

    // After two requests, SC_GU_U=test should hit the rate limit.
    await request(server)
      .get('/register')
      .set('Cookie', 'SC_GU_U=test')
      .expect(200);
    await request(server)
      .get('/register')
      .set('Cookie', 'SC_GU_U=test')
      .expect(200);
    await request(server)
      .get('/register')
      .set('Cookie', 'SC_GU_U=test')
      .expect(429);

    // SC_GU_U=other should be allowed to make a request
    await request(server)
      .get('/register')
      .set('Cookie', 'SC_GU_U=other')
      .expect(200);

    await new Promise((r) => setTimeout(r, 500));

    // After 100ms SC_GU_U=test can make a request again.
    await request(server)
      .get('/register')
      .set('Cookie', 'SC_GU_U=test')
      .expect(200);

    await done();
  });

  it('should rate limit /signin form when the email bucket is empty', async () => {
    const rateLimiterConfig = {
      enabled: true,
      defaultBuckets: {
        globalBucket: { capacity: 500, addTokenMs: 500 },
      },
      routeBuckets: {
        '/signin': {
          globalBucket: { capacity: 500, addTokenMs: 50 },
          emailBucket: { capacity: 1, addTokenMs: 500 },
        },
      },
    };

    // Start the application server.
    const { server, done } = await getServerInstance(rateLimiterConfig);

    // Consume the only token available for this email
    await request(server)
      .post('/signin?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fuk')
      .type('application/x-www-form-urlencoded')
      .send({
        email: 'test@test.com',
        password: '',
      })
      .expect(303)
      .expect('Location', 'https://www.theguardian.com/uk');

    // No more tokens left for this email, check that rate limiter kicks in
    await request(server)
      .post('/signin')
      .type('application/x-www-form-urlencoded')
      .send({
        email: 'test@test.com',
        password: '',
      })
      .expect(429);

    // Make sure that other emails are still allowed through the rate limiter
    await request(server)
      .post('/signin?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fuk')
      .type('application/x-www-form-urlencoded')
      .send({
        email: 'newTest@test.com',
        password: '',
      })
      .expect(303)
      .expect('Location', 'https://www.theguardian.com/uk');

    // Wait 100ms for a token to be added back to the bucket.
    await new Promise((r) => setTimeout(r, 500));

    // Check that a new request goes through successfully
    await request(server)
      .post('/signin')
      .type('application/x-www-form-urlencoded')
      .send({
        email: 'test@test.com',
        password: 'tests',
      })
      .expect(303);

    await done();
  });
});
