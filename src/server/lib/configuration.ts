import { Configuration } from '@/server/models/Configuration';

export const getConfiguration = (): Configuration => {
  const port = process.env.PORT;
  const idapiBaseUrl = process.env.IDAPI_BASE_URL;
  const idapiClientAccessToken = process.env.IDAPI_CLIENT_ACCESS_TOKEN;

  if (!port) {
    throw Error('Port configuration missing.');
  }

  if (!idapiBaseUrl) {
    throw Error('IDAPI Base URL Missing.');
  }

  if (!idapiClientAccessToken) {
    throw Error('IDAPI Client Access Token missing.');
  }

  return {
    port: +port,
    idapiBaseUrl,
    idapiClientAccessToken,
  };
};
