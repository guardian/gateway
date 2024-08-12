/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
import type { RateLimiterConfiguration } from '@/server/lib/rate-limit';
import { Stage } from '@/shared/model/Configuration';

export interface Configuration {
	port: number;
	idapiClientAccessToken: string;
	idapiBaseUrl: string;
	signInPageUrl: string;
	baseUri: string;
	defaultReturnUri: string;
	stage: Stage;
	googleRecaptcha: {
		siteKey: string;
		secretKey: string;
	};
	guardianDotcomDomain: string;
	apiDomain: string;
	isHttps: boolean;
	appSecret: string;
	encryptionSecretKey: string;
	oauthBaseUrl: string;
	okta: Okta;
	githubRunNumber: string;
	sentryDsn: string;
	redis: RedisConfiguration;
	accountManagementUrl: string;
	rateLimiter: RateLimiterConfiguration;
	membersDataApiUrl: string;
	passcodesEnabled: boolean;
	deleteAccountStepFunction: {
		url: string;
		apiKey: string;
	};
}

export interface Okta {
	enabled: boolean;
	orgUrl: string;
	token: string;
	authServerId: string;
	clientId: string;
	clientSecret: string;
	groupIds: {
		GuardianUserAll: string;
	};
	social: {
		apple: string;
		google: string;
	};
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
	sslOn: boolean;
}
