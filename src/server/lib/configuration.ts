import {
  Configuration,
  GA_UID,
  GA_UID_HASH,
  GU_API_DOMAIN,
  GU_DOMAIN,
} from '@/server/models/Configuration';

const getOrThrow = (value: string | undefined, errorMessage: string) => {
  if (!value) {
    throw Error(errorMessage);
  }
  return value;
};

const gaUIDFromStage = (stage: string): [string, string] => {
  switch (stage) {
    case 'PROD':
      return [GA_UID.PROD, GA_UID_HASH.PROD];
    case 'CODE':
      return [GA_UID.CODE, GA_UID_HASH.CODE];
    default:
      return [GA_UID.DEV, GA_UID_HASH.DEV];
  }
};

const guardianDomainFromStage = (stage: string): [string, string] => {
  switch (stage) {
    case 'PROD':
      return [GU_DOMAIN.PROD, GU_API_DOMAIN.PROD];
    case 'CODE':
      return [GU_DOMAIN.CODE, GU_API_DOMAIN.CODE];
    default:
      return [GU_DOMAIN.DEV, GU_API_DOMAIN.DEV];
  }
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

  const signInPageUrl = getOrThrow(
    process.env.SIGN_IN_PAGE_URL,
    'Sign in page URL page missing',
  );

  const baseUri = getOrThrow(process.env.BASE_URI, 'Base URI missing.');

  const defaultReturnUri = getOrThrow(
    process.env.DEFAULT_RETURN_URI,
    'Default return URI missing.',
  );

  const stage = getOrThrow(process.env.STAGE, 'Stage variable missing.');

  const [gaId, gaIdHash] = gaUIDFromStage(stage);

  const [domain, apiDomain] = guardianDomainFromStage(stage);

  const isHttps: boolean = JSON.parse(
    getOrThrow(process.env.IS_HTTPS, 'IS_HTTPS config missing.'),
  );

  return {
    port: +port,
    idapiBaseUrl,
    idapiClientAccessToken,
    playSessionCookieSecret,
    signInPageUrl,
    baseUri,
    defaultReturnUri,
    stage,
    gaUID: {
      id: gaId,
      hash: gaIdHash,
    },
    domain,
    apiDomain,
    isHttps,
  };
};
