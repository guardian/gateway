import { RateLimiterConfiguration } from '@/server/lib/rate-limit';

export const defaultRateLimiterConfiguration = {
	enabled: false,
	settings: {
		logOnly: false,
		trackBucketCapacity: false,
	},
	defaultBuckets: {
		globalBucket: { capacity: 500, addTokenMs: 50 },
		ipBucket: { capacity: 100, addTokenMs: 50 },
		emailBucket: { capacity: 100, addTokenMs: 50 },
		oktaIdentifierBucket: { capacity: 100, addTokenMs: 50 },
		accessTokenBucket: { capacity: 100, addTokenMs: 50 },
	},
	routeBuckets: {},
};

const defaultEnv = {
	PORT: '9000',
	IDAPI_CLIENT_ACCESS_TOKEN: 'idapi_api_key',
	IDAPI_BASE_URL: 'http://localhost:1234',
	OAUTH_BASE_URL: 'http://localhost:5678',
	BASE_URI: 'base-uri',
	DEFAULT_RETURN_URI: 'default-return-uri',
	SIGN_IN_PAGE_URL: 'sign-in-page-url',
	MEMBERS_DATA_API_URL: 'members-data-api-url',
	USER_BENEFITS_API_URL: 'user-benefits-api-url',
	PRINT_PROMO_URL: 'print-promo-url',
	MEMBERSHIP_BRAZE_SQS_URL: 'membership-braze-sqs-url',
	STAGE: 'DEV',
	IS_HTTPS: 'true',
	APP_SECRET: 'app-secret',
	GOOGLE_RECAPTCHA_SITE_KEY: 'recaptcha-site',
	GOOGLE_RECAPTCHA_SECRET_KEY: 'recaptcha-secret',
	ENCRYPTION_SECRET_KEY:
		'f3d87b231ddd6f50d99e227c5bc9b7cbb649387b321008df412fd73805ac2e32',
	OKTA_ORG_URL: 'oktaorgurl',
	OKTA_API_TOKEN: 'oktatoken',
	OKTA_CUSTOM_OAUTH_SERVER: 'customoauthserverid',
	OKTA_CLIENT_ID: 'oktaclientid',
	OKTA_CLIENT_SECRET: 'oktaclientsecret',
	OKTA_IDP_APPLE: 'okta-idp-apple',
	OKTA_IDP_GOOGLE: 'okta-idp-google',
	OKTA_GUARDIAN_USERS_ALL_GROUP_ID: 'okta-guardian-users-group-id',
	GITHUB_RUN_NUMBER: '5',
	REDIS_PASSWORD: 'redispassword',
	REDIS_HOST: 'localhost:1234',
	REDIS_SSL: 'false',
	DELETE_ACCOUNT_STEP_FUNCTION_URL: 'delete-account-step-function-url',
	DELETE_ACCOUNT_STEP_FUNCTION_API_KEY: 'delete-account-api-key',
};

export const getServerInstance = async (
	rateLimiterConfig: RateLimiterConfiguration = defaultRateLimiterConfiguration,
) => {
	// eslint-disable-next-line functional/immutable-data -- used in tests
	process.env = {
		...defaultEnv,
		RATE_LIMITER_CONFIG: JSON.stringify(rateLimiterConfig),
	};

	// Start the application server.
	const { default: server } = await import('@/server/server');
	const serverInstance = server();

	return serverInstance;
};
