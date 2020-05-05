import { Configuration } from '@/server/models/Configuration';

export const getConfiguration = (): Configuration => {
  const port = process.env.PORT;
  const idapiBaseUrl = process.env.IDAPI_BASE_URL;
  const idapiClientAccessToken = process.env.IDAPI_CLIENT_ACCESS_TOKEN;
  const playSessionCookieSecret = process.env.PLAY_SESSION_COOKIE_SECRET;

  if (!port) {
    throw Error('Port configuration missing.');
  }

  if (!idapiBaseUrl) {
    throw Error('IDAPI Base URL missing.');
  }

  if (!idapiClientAccessToken) {
    throw Error('IDAPI Client Access Token missing.');
  }

  if (!playSessionCookieSecret) {
    throw Error('Play Session Cookie Secret missing.');
  }

  return {
    port: +port,
    idapiBaseUrl,
    idapiClientAccessToken,
    playSessionCookieSecret,
  };
};
