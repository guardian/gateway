import {
	Configuration,
	GU_API_DOMAIN,
	GU_DOMAIN,
	RedisConfiguration,
	GU_MANAGE_URL,
	Okta,
} from '@/server/models/Configuration';
import { featureSwitches } from '@/shared/lib/featureSwitches';
import validatedRateLimiterConfiguration from '@/server/lib/rateLimiterConfiguration';
import { format } from 'util';
import { Stage } from '@/shared/model/Configuration';

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
	guardianDotcomDomain: string;
	apiDomain: string;
	passcodesEnabled: boolean;
	accountManagementUrl: string;
}

const getStageVariables = (stage: Stage): StageVariables => {
	switch (stage) {
		case 'PROD':
			return {
				guardianDotcomDomain: GU_DOMAIN.PROD,
				apiDomain: GU_API_DOMAIN.PROD,
				passcodesEnabled: featureSwitches.passcodesEnabled.PROD,
				accountManagementUrl: GU_MANAGE_URL.PROD,
			};
		case 'CODE':
			return {
				guardianDotcomDomain: GU_DOMAIN.CODE,
				apiDomain: GU_API_DOMAIN.CODE,
				passcodesEnabled: featureSwitches.passcodesEnabled.CODE,
				accountManagementUrl: GU_MANAGE_URL.CODE,
			};
		default:
			return {
				guardianDotcomDomain: GU_DOMAIN.DEV,
				apiDomain: GU_API_DOMAIN.DEV,
				passcodesEnabled: featureSwitches.passcodesEnabled.DEV,
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
		guardianDotcomDomain,
		apiDomain,
		accountManagementUrl,
		passcodesEnabled,
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

	const membersDataApiUrl = getOrThrow(
		process.env.MEMBERS_DATA_API_URL,
		'Members Data API URL missing.',
	);

	const userBenefitsApiUrl = getOrThrow(
		process.env.USER_BENEFITS_API_URL,
		'User Benefits API URL missing.',
	);

	const okta: Okta = {
		enabled: true,
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
			google: getOrThrow(
				process.env.OKTA_IDP_GOOGLE,
				'OKTA Google IDP id missing',
			),
		},
	};

	const githubRunNumber = getOrDefault(process.env.GITHUB_RUN_NUMBER, '0');

	const redis: RedisConfiguration = {
		password: getOrThrow(process.env.REDIS_PASSWORD, 'Redis Password Missing'),
		host: getOrThrow(process.env.REDIS_HOST, 'Redis Host missing'),
		sslOn: JSON.parse(getOrDefault(process.env.REDIS_SSL_ON, 'false')),
	};

	const deleteAccountStepFunction: Configuration['deleteAccountStepFunction'] =
		{
			url: getOrThrow(
				process.env.DELETE_ACCOUNT_STEP_FUNCTION_URL,
				'DELETE_ACCOUNT_STEP_FUNCTION_URL missing',
			),
			apiKey: getOrThrow(
				process.env.DELETE_ACCOUNT_STEP_FUNCTION_API_KEY,
				'DELETE_ACCOUNT_STEP_FUNCTION_API_KEY missing',
			),
		};

	return {
		port: +port,
		idapiBaseUrl,
		idapiClientAccessToken,
		signInPageUrl,
		baseUri,
		defaultReturnUri,
		stage,
		guardianDotcomDomain,
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
		githubRunNumber,
		redis,
		accountManagementUrl,
		rateLimiter,
		membersDataApiUrl,
		userBenefitsApiUrl,
		passcodesEnabled: passcodesEnabled,
		deleteAccountStepFunction,
	};
};
