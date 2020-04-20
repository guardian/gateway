import { Configuration } from '@/server/models/Configuration';

export const getConfiguration = (): Configuration => {
  const port = process.env.PORT;
  const apiEndpoint = process.env.IDAPI_ENDPOINT;
  const apiKey = process.env.IDAPI_API_KEY;

  if (!port) {
    throw Error('Port configuration missing.');
  }

  if (!apiEndpoint) {
    throw Error('IDAPI Endpoint missing.');
  }

  if (!apiKey) {
    throw Error('IDAPI API Key missing.');
  }

  return {
    port: +port,
    apiEndpoint,
    apiKey,
  };
};
