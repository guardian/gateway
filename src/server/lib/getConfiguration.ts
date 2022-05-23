import {
  AWSConfiguration,
  Configuration,
  GA_UID,
  GA_UID_HASH,
  GU_API_DOMAIN,
  GU_DOMAIN,
  RedisConfiguration,
  Stage,
  GU_MANAGE_URL,
  Okta,
} from '@/server/models/Configuration';
import { featureSwitches } from '@/shared/lib/featureSwitches';
import validatedRateLimiterConfiguration from '@/server/lib/rateLimiterConfiguration';
import { format } from 'util';

const getOrThrow = (
  value: string | undefined,
  errorMessage: string,
  strictCheck = true,
) => {
  if (typeof value === 'undefined' || (strictCheck && value === '')) {
    throw Error(errorMessage);
  }
  return value;
};

const getOrDefault = (value: string | undefined, defaultValue: string) => {
  if (typeof value === 'undefined') {
    return defaultValue;
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
  oktaEnabled: boolean;
  accountManagementUrl: string;
}

const getStageVariables = (stage: Stage): StageVariables => {
  switch (stage) {
    case 'PROD':
      return {
        gaId: GA_UID.PROD,
        gaIdHash: GA_UID_HASH.PROD,
        domain: GU_DOMAIN.PROD,
        apiDomain: GU_API_DOMAIN.PROD,
        oktaEnabled: featureSwitches.oktaEnabled.PROD,
        accountManagementUrl: GU_MANAGE_URL.PROD,
      };
    case 'CODE':
      return {
        gaId: GA_UID.CODE,
        gaIdHash: GA_UID_HASH.CODE,
        domain: GU_DOMAIN.CODE,
        apiDomain: GU_API_DOMAIN.CODE,
        oktaEnabled: featureSwitches.oktaEnabled.CODE,
        accountManagementUrl: GU_MANAGE_URL.CODE,
      };
    default:
      return {
        gaId: GA_UID.DEV,
        gaIdHash: GA_UID_HASH.DEV,
        domain: GU_DOMAIN.DEV,
        apiDomain: GU_API_DOMAIN.DEV,
        oktaEnabled: featureSwitches.oktaEnabled.DEV,
        accountManagementUrl: GU_MANAGE_URL.DEV,
      };
  }
};

export const getConfiguration = (): Configuration => {
  const port = getOrThrow(process.env.PORT, 'Port configuration missing.');

  // Make sure that there was not an error reading the rate limiter configuration.
  if (typeof validatedRateLimiterConfiguration === 'undefined') {
    throw new Error('Rate limiter configuration missing');
  }

  // Check that there was not an error validating the loaded configuration.
  if (!validatedRateLimiterConfiguration.success) {
    const validationError = validatedRateLimiterConfiguration.error;
    const formattedError = format('%O', validationError.issues);
    throw new Error(
      'There was a problem parsing the rate limiter configuration ' +
        formattedError,
    );
  }

  // Continue with the validated configuration.
  const rateLimiter = validatedRateLimiterConfiguration.data;

  const idapiBaseUrl = getOrThrow(
    process.env.IDAPI_BASE_URL,
    'IDAPI Base URL missing.',
  );

  const idapiClientAccessToken = getOrThrow(
    process.env.IDAPI_CLIENT_ACCESS_TOKEN,
    'IDAPI Client Access Token missing.',
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

  const {
    gaId,
    gaIdHash,
    domain,
    apiDomain,
    oktaEnabled,
    accountManagementUrl,
  } = getStageVariables(stage);

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

  const okta: Okta = {
    enabled: oktaEnabled,
    orgUrl: getOrThrow(process.env.OKTA_ORG_URL, 'OKTA org URL missing'),
    token: getOrThrow(process.env.OKTA_API_TOKEN, 'OKTA API token missing'),
    authServerId: getOrThrow(
      process.env.OKTA_CUSTOM_OAUTH_SERVER,
      'OKTA custom oauth server id missing',
    ),
    clientId: getOrThrow(process.env.OKTA_CLIENT_ID, 'OKTA client id missing'),
    clientSecret: getOrThrow(
      process.env.OKTA_CLIENT_SECRET,
      'OKTA client secret missing',
    ),
    social: {
      apple: getOrThrow(
        process.env.OKTA_IDP_APPLE,
        'OKTA Apple IDP id missing',
      ),
      facebook: getOrThrow(
        process.env.OKTA_IDP_FACEBOOK,
        'OKTA Facebook IDP id missing',
      ),
      google: getOrThrow(
        process.env.OKTA_IDP_GOOGLE,
        'OKTA Google IDP id missing',
      ),
    },
  };

  const sentryDsn = getOrDefault(process.env.SENTRY_DSN, '');
  const githubRunNumber = getOrDefault(process.env.GITHUB_RUN_NUMBER, '0');

  const aws: AWSConfiguration = {
    kinesisStreamName:
      stage === 'DEV'
        ? process.env.LOGGING_KINESIS_STREAM || ''
        : getOrThrow(
            process.env.LOGGING_KINESIS_STREAM,
            'LOGGING_KINESIS_STREAM missing',
            false,
          ),
    instanceId:
      stage === 'DEV'
        ? ''
        : getOrThrow(
            process.env.EC2_INSTANCE_ID,
            'EC2_INSTANCE_ID missing',
            false,
          ),
  };

  const redis: RedisConfiguration = {
    password: getOrThrow(process.env.REDIS_PASSWORD, 'Redis Password Missing'),
    host: getOrThrow(process.env.REDIS_HOST, 'Redis Host missing'),
    sslOn: JSON.parse(getOrDefault(process.env.REDIS_SSL_ON, 'false')),
  };

  return {
    port: +port,
    idapiBaseUrl,
    idapiClientAccessToken,
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
    githubRunNumber,
    sentryDsn,
    redis,
    accountManagementUrl,
    rateLimiter,
  };
};
