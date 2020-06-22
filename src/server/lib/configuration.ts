import { Configuration } from '@/server/models/Configuration';

const getOrThrow = (value: string | undefined, errorMessage: string) => {
  if (!value) {
    throw Error(errorMessage);
  }
  return value;
};

export const getConfiguration = (): Configuration => {
  const port = getOrThrow(process.env.PORT, 'Port configuration missing.');

  const idapiBaseUrl = getOrThrow(
    process.env.IDAPI_BASE_URL,
    'IDAPI Base URL missing.',
  );

  const idapiClientAccessToken = getOrThrow(
    process.env.IDAPI_CLIENT_ACCESS_TOKEN,
    'IDAPI Client Access Token missing.',
  );

  const playSessionCookieSecret = getOrThrow(
    process.env.PLAY_SESSION_COOKIE_SECRET,
    'Play Session Cookie Secret missing.',
  );

  const baseUri = getOrThrow(process.env.BASE_URI, 'Base URI missing.');

  const defaultReturnUri = getOrThrow(
    process.env.DEFAULT_RETURN_URI,
    'Default return URI missing.',
  );

  const stage = getOrThrow(process.env.STAGE, 'Stage variable missing.');

  return {
    port: +port,
    idapiBaseUrl,
    idapiClientAccessToken,
    playSessionCookieSecret,
    baseUri,
    defaultReturnUri,
    stage,
  };
};
