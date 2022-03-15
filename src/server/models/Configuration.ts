import type { RateLimiterConfiguration } from '@/server/lib/rate-limit';

export type Stage = 'DEV' | 'CODE' | 'PROD';
export interface Configuration {
  port: number;
  idapiClientAccessToken: string;
  idapiBaseUrl: string;
  signInPageUrl: string;
  baseUri: string;
  defaultReturnUri: string;
  stage: Stage;
  gaUID: {
    id: string;
    hash: string;
  };
  googleRecaptcha: {
    siteKey: string;
    secretKey: string;
  };
  domain: string;
  apiDomain: string;
  isHttps: boolean;
  appSecret: string;
  encryptionSecretKey: string;
  oauthBaseUrl: string;
  okta: Okta;
  aws: AWSConfiguration;
  githubRunNumber: string;
  sentryDsn: string;
  redis: RedisConfiguration;
  accountManagementUrl: string;
  rateLimiter: RateLimiterConfiguration;
}

export interface AWSConfiguration {
  kinesisStreamName: string;
  instanceId: string;
}

export interface Okta {
  enabled: boolean;
  orgUrl: string;
  token: string;
  authServerId: string;
  clientId: string;
  clientSecret: string;
}

export enum GA_UID {
  DEV = 'UA-33592456-10',
  CODE = 'UA-33592456-10',
  PROD = 'UA-78705427-4',
}

// for helmet csp
export enum GA_UID_HASH {
  DEV = `'sha256-411aj9j2RJj78RLGlCL/KDMK0fe6OEh8Vp6NzyYIkP4='`,
  CODE = `'sha256-411aj9j2RJj78RLGlCL/KDMK0fe6OEh8Vp6NzyYIkP4='`,
  PROD = `'sha256-eK1AOAxz59vbOJnu9xunP2iz4Sar2B6if0ZkiINBfGM='`,
}

export enum GU_DOMAIN {
  DEV = 'thegulocal.com',
  CODE = 'code.dev-theguardian.com',
  PROD = 'theguardian.com',
}

export enum GU_API_DOMAIN {
  DEV = 'code.dev-guardianapis.com',
  CODE = 'code.dev-guardianapis.com',
  PROD = 'guardianapis.com',
}

export enum GU_MANAGE_URL {
  DEV = 'https://manage.code.dev-theguardian.com',
  CODE = 'https://manage.code.dev-theguardian.com',
  PROD = 'https://manage.theguardian.com',
}
export interface RedisConfiguration {
  password: string;
  host: string;
}
