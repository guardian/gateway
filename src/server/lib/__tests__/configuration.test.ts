import { getConfiguration } from '@/server/lib/configuration';
import { GA_UID, GA_UID_HASH } from '@/server/models/Configuration';

describe('getConfiguration', () => {
  const ORIGINAL_ENVIRONMENT_VARIABLES = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENVIRONMENT_VARIABLES };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENVIRONMENT_VARIABLES;
  });

  test('it returns the configuration object with the correct values', () => {
    process.env.PORT = '9000';
    process.env.IDAPI_CLIENT_ACCESS_TOKEN = 'idapi_api_key';
    process.env.IDAPI_BASE_URL = 'http://localhost:1234';
    process.env.PLAY_SESSION_COOKIE_SECRET = 'play-secret';
    process.env.BASE_URI = 'base-uri';
    process.env.DEFAULT_RETURN_URI = 'default-return-uri';
    process.env.STAGE = 'DEV';

    const output = getConfiguration();
    const expected = {
      port: 9000,
      idapiClientAccessToken: 'idapi_api_key',
      idapiBaseUrl: 'http://localhost:1234',
      playSessionCookieSecret: 'play-secret',
      baseUri: 'base-uri',
      defaultReturnUri: 'default-return-uri',
      stage: 'DEV',
      gaUID: {
        id: GA_UID.DEV,
        hash: GA_UID_HASH.DEV,
      },
    };
    expect(output).toEqual(expected);
  });

  test('it throws and exception if the port is not set', () => {
    process.env = {};
    expect(() => getConfiguration()).toThrow();
  });
});
