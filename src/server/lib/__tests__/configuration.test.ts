import { getConfiguration } from '@/server/lib/configuration';

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

    const output = getConfiguration();
    const expected = {
      port: 9000,
      idapiClientAccessToken: 'idapi_api_key',
      idapiBaseUrl: 'http://localhost:1234',
    };
    expect(output).toEqual(expected);
  });

  test('it throws and exception if the port is not set', () => {
    expect(() => getConfiguration()).toThrow();
  });
});
