import {
	addQueryParamsToPath,
	getPersistableQueryParams,
	removeEmptyKeysFromObjectAndConvertValuesToString,
} from '@/shared/lib/queryParams';
import {
	QueryParams,
	PersistableQueryParams,
} from '@/shared/model/QueryParams';

describe('getPersistableQueryParams', () => {
	it('removes params that should not persist from the query object', () => {
		const input: QueryParams = {
			returnUrl: 'returnUrl',
			clientId: 'jobs',
			csrfError: true,
			recaptchaError: true,
			emailVerified: true,
			encryptedEmail: 'encryptedEmail',
			error: 'error',
			ref: 'ref',
			refViewId: 'refViewId',
			componentEventParams: 'componentEventParams',
			fromURI: 'fromURI',
			appClientId: 'appClientId',
			newOnboardingFlow: true,
		};

		const output = getPersistableQueryParams(input);

		const expected: PersistableQueryParams = {
			returnUrl: 'returnUrl',
			clientId: 'jobs',
			ref: 'ref',
			refViewId: 'refViewId',
			componentEventParams: 'componentEventParams',
			fromURI: 'fromURI',
			appClientId: 'appClientId',
			useOktaClassic: undefined,
			listName: undefined,
			usePasswordSignIn: undefined,
			useSetPassword: undefined,
			newOnboardingFlow: true,
		};

		expect(output).toStrictEqual(expected);
	});
});

describe('addQueryParamsToPath', () => {
	it('adds persistable query params to path without preexisting querystring', () => {
		const input: QueryParams = {
			returnUrl: 'returnUrl',
			clientId: 'jobs',
			csrfError: true,
			recaptchaError: true,
			emailVerified: true,
			encryptedEmail: 'encryptedEmail',
			error: 'error',
			ref: 'ref',
			refViewId: 'refViewId',
			componentEventParams: 'componentEventParams',
			newOnboardingFlow: true,
		};

		const output = addQueryParamsToPath('/consents', input);

		expect(output).toEqual(
			'/consents?clientId=jobs&componentEventParams=componentEventParams&newOnboardingFlow=true&ref=ref&refViewId=refViewId&returnUrl=returnUrl',
		);
	});

	it('adds persistable query params to path without preexisting querystring, with manual override values', () => {
		const input: QueryParams = {
			returnUrl: 'returnUrl',
			clientId: 'jobs',
			csrfError: false,
			recaptchaError: false,
			emailVerified: true,
			encryptedEmail: 'encryptedEmail',
			error: 'error',
			ref: 'ref',
			refViewId: 'refViewId',
			componentEventParams: 'componentEventParams',
		};

		const inputOverride: Partial<QueryParams> = {
			csrfError: true,
			recaptchaError: true,
			encryptedEmail: 'an encrypted email',
		};

		const output = addQueryParamsToPath('/consents', input, inputOverride);

		expect(output).toEqual(
			'/consents?clientId=jobs&componentEventParams=componentEventParams&csrfError=true&encryptedEmail=an+encrypted+email&recaptchaError=true&ref=ref&refViewId=refViewId&returnUrl=returnUrl',
		);
	});

	it('removes undefined or empty string values from the querystring', () => {
		const input: QueryParams = {
			returnUrl: 'returnUrl',
			clientId: 'jobs',
			csrfError: true,
			recaptchaError: true,
			emailVerified: true,
			encryptedEmail: 'encryptedEmail',
			error: 'error',
			ref: undefined,
			refViewId: '',
			componentEventParams: 'componentEventParams',
		};

		const output = addQueryParamsToPath('/consents', input);

		expect(output).toEqual(
			'/consents?clientId=jobs&componentEventParams=componentEventParams&returnUrl=returnUrl',
		);
	});

	it('preserves newOnboardingFlow=true in welcome redirect URLs', () => {
		const input: QueryParams = {
			returnUrl: 'https://www.theguardian.com',
			newOnboardingFlow: true,
		};

		const output = addQueryParamsToPath('/welcome/onboarding', input);

		expect(output).toEqual(
			'/welcome/onboarding?newOnboardingFlow=true&returnUrl=https%3A%2F%2Fwww.theguardian.com',
		);
	});
});

describe('removeEmptyKeysFromObjectAndConvertValuesToString', () => {
	it('removes undefined or empty string values from the object', () => {
		const input: QueryParams = {
			returnUrl: 'returnUrl',
			clientId: 'jobs',
			csrfError: true,
			recaptchaError: true,
			emailVerified: true,
			encryptedEmail: 'encryptedEmail',
			error: 'error',
			ref: undefined,
			refViewId: '',
			componentEventParams: 'componentEventParams',
		};

		const output = removeEmptyKeysFromObjectAndConvertValuesToString(input);

		expect(output).toEqual({
			returnUrl: 'returnUrl',
			clientId: 'jobs',
			csrfError: 'true',
			recaptchaError: 'true',
			emailVerified: 'true',
			encryptedEmail: 'encryptedEmail',
			error: 'error',
			componentEventParams: 'componentEventParams',
		});
	});
});
