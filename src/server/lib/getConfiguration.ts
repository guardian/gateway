import {
  AWSConfiguration,
  Configuration,
  GA_UID,
  GA_UID_HASH,
  GU_API_DOMAIN,
  GU_DOMAIN,
  Stage,
} from '@/server/models/Configuration';
import { featureSwitches } from '@/shared/lib/featureSwitches';

const getOrThrow = (value: string | undefined, errorMessage: string) => {
  if (!value) {
    throw Error(errorMessage);
  }
  return value;
};

const getStage = (value: string | undefined): Stage => {
  const maybeStage = getOrThrow(value, 'Stage variable missing.');

  switch (maybeStage) {
    case 'DEV':
      return 'DEV';
    case 'CODE':
      return 'CODE';
    case 'PROD':
      return 'PROD';
    default:
      throw Error('Invalid stage variable');
  }
};

interface StageVariables {
  gaId: string;
  gaIdHash: string;
  domain: string;
  apiDomain: string;
  oktaRegistrationEnabled: boolean;
}

const getStageVariables = (stage: Stage): StageVariables => {
  switch (stage) {
    case 'PROD':
      return {
        gaId: GA_UID.PROD,
        gaIdHash: GA_UID_HASH.PROD,
        domain: GU_DOMAIN.PROD,
        apiDomain: GU_API_DOMAIN.PROD,
        oktaRegistrationEnabled: featureSwitches.oktaRegistrationEnabled.PROD,
      };
    case 'CODE':
      return {
        gaId: GA_UID.CODE,
        gaIdHash: GA_UID_HASH.CODE,
        domain: GU_DOMAIN.CODE,
        apiDomain: GU_API_DOMAIN.CODE,
        oktaRegistrationEnabled: featureSwitches.oktaRegistrationEnabled.CODE,
      };
    default:
      return {
        gaId: GA_UID.DEV,
        gaIdHash: GA_UID_HASH.DEV,
        domain: GU_DOMAIN.DEV,
        apiDomain: GU_API_DOMAIN.DEV,
        oktaRegistrationEnabled: featureSwitches.oktaRegistrationEnabled.DEV,
      };
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

  const stage = getStage(process.env.STAGE);

  const { gaId, gaIdHash, domain, apiDomain, oktaRegistrationEnabled } =
    getStageVariables(stage);

  const isHttps: boolean = JSON.parse(
    getOrThrow(process.env.IS_HTTPS, 'IS_HTTPS config missing.'),
  );

  const appSecret: string = getOrThrow(
    process.env.APP_SECRET,
    'APP_SECRET config missing.',
  );

  const googleRecaptchaSiteKey = getOrThrow(
    process.env.GOOGLE_RECAPTCHA_SITE_KEY,
    'Google Recaptcha site key is missing',
  );

  const googleRecaptchaSecretKey = getOrThrow(
    process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
    'Google Recaptcha secret key is missing',
  );

  const encryptionSecretKey = getOrThrow(
    process.env.ENCRYPTION_SECRET_KEY,
    'ENCRYPTION_SECRET_KEY is missing',
  );

  const oauthBaseUrl = getOrThrow(
    process.env.OAUTH_BASE_URL,
    'OAuth Base URL missing.',
  );

  const okta = {
    registrationEnabled: oktaRegistrationEnabled,
    orgUrl: getOrThrow(process.env.OKTA_ORG_URL, 'OKTA org URL missing'),
    token: getOrThrow(process.env.OKTA_API_TOKEN, 'OKTA API token missing'),
  };

  const aws: AWSConfiguration = {
    kinesisStreamName:
      stage === 'DEV'
        ? process.env.LOGGING_KINESIS_STREAM || ''
        : getOrThrow(
            process.env.LOGGING_KINESIS_STREAM,
            'LOGGING_KINESIS_STREAM missing',
          ),
    instanceId:
      stage === 'DEV'
        ? ''
        : getOrThrow(process.env.EC2_INSTANCE_ID, 'EC2_INSTANCE_ID missing'),
  };

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
    appSecret,
    googleRecaptcha: {
      siteKey: googleRecaptchaSiteKey,
      secretKey: googleRecaptchaSecretKey,
    },
    encryptionSecretKey,
    oauthBaseUrl,
    okta,
    aws,
  };
};
