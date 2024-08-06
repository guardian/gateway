import { getConfiguration } from '@/server/lib/getConfiguration';
import {
	addReturnUrlToPath,
	parseExpressQueryParams,
} from '@/server/lib/queryParams';

// mock configuration to return a default uri
jest.mock('@/server/lib/getConfiguration', () => ({
	getConfiguration: () => ({ defaultReturnUri: 'default-uri' }),
}));

jest.mock('@/server/lib/serverSideLogger', () => ({
	logger: {
		error: jest.fn(),
	},
}));

describe('parseExpressQueryParams', () => {
	const { defaultReturnUri } = getConfiguration();

	describe('returnUrl', () => {
		test('it returns query params when returnUrl is passed in', () => {
			const input = {
				returnUrl:
					'https://www.theguardian.com/games/2020/mar/16/animal-crossing-new-horizons-review-nintendo-switch',
			};

			const output = parseExpressQueryParams('GET', input);

			expect(output).toEqual(input);
		});

		test('it returns query params with default returnUrl if returnUrl is not passed in', () => {
			const input = {};

			const expected = {
				returnUrl: defaultReturnUri,
			};

			const output = parseExpressQueryParams('GET', input);

			expect(output).toEqual(expected);
		});
	});

	describe('componentEventParams', () => {
		test('it returns query params when componentEventParams is passed in', () => {
			const input = {
				componentEventParams:
					'componentType%3Dsigningate%26componentId%3Dmain_variant_4%26abTestName%3DSignInGateMain%26abTestVariant%3Dmain-variant-4%26browserId%3DidFromPV_EPayYBwrFU6V13wZIDiMLw%26visitId%3DAYAIQL2G%26viewId%3Dl1q5pdg4slc3vzz68dzs',
			};

			const output = parseExpressQueryParams('GET', input);

			expect(output).toEqual({ ...input, returnUrl: defaultReturnUri });
		});
	});

	describe('clientId', () => {
		test('it returns clientId in query params if valid', () => {
			const input = {
				clientId: 'jobs',
			};

			const output = parseExpressQueryParams('GET', input);

			expect(output).toEqual({ ...input, returnUrl: defaultReturnUri });
		});

		test('it returns undefined clientId in query params if not valid', () => {
			const input = {
				clientId: 'invalidClientId',
			};

			const output = parseExpressQueryParams('GET', input);

			expect(output).toEqual({ returnUrl: defaultReturnUri });
		});
	});

	describe('csrfError', () => {
		test('it should set csrfError param if set for GETs', () => {
			const input = {
				csrfError: 'true',
			};
			const output = parseExpressQueryParams('GET', input);
			expect(output.csrfError).toEqual(true);
		});
		test('it should not set csrfError param if not set for GETs', () => {
			const input = {};
			const output = parseExpressQueryParams('GET', input);
			expect(output.csrfError).toEqual(undefined);
		});
		test('it should not set csrfError param if set for POSTs', () => {
			const input = {
				csrfError: 'true',
			};
			const output = parseExpressQueryParams('POST', input);
			expect(output.csrfError).toEqual(undefined);
		});
		test('it should not set csrfError param if not set for POSTs', () => {
			const input = {};
			const output = parseExpressQueryParams('POST', input);
			expect(output.csrfError).toEqual(undefined);
		});
	});

	describe('recaptchaError', () => {
		test('it should set recaptchaError param if set for GETs', () => {
			const input = {
				recaptchaError: 'true',
			};
			const output = parseExpressQueryParams('GET', input);
			expect(output.recaptchaError).toEqual(true);
		});
		test('it should not set recaptchaError param if not set for GETs', () => {
			const input = {};
			const output = parseExpressQueryParams('GET', input);
			expect(output.recaptchaError).toEqual(undefined);
		});
		test('it should not set recaptchaError param if set for POSTs', () => {
			const input = {
				recaptchaError: 'true',
			};
			const output = parseExpressQueryParams('POST', input);
			expect(output.recaptchaError).toEqual(undefined);
		});
		test('it should not set recaptchaError param if not set for POSTs', () => {
			const input = {};
			const output = parseExpressQueryParams('POST', input);
			expect(output.recaptchaError).toEqual(undefined);
		});
	});
});

describe('addReturnUrlToPath', () => {
	describe('when there are no existing parameters', () => {
		it('adds an encoded query parameter', () => {
			const input = '/test/path';
			const output = addReturnUrlToPath(input, 'a:// test');
			const expected = '/test/path?returnUrl=a%3A%2F%2F%20test';
			expect(output).toEqual(expected);
		});
	});

	describe('when there is a trailing slash', () => {
		it('adds an encoded query parameter after the trailing slash', () => {
			const input = '/test/path/';
			const output = addReturnUrlToPath(input, 'a:// test');
			const expected = '/test/path/?returnUrl=a%3A%2F%2F%20test';
			expect(output).toEqual(expected);
		});
	});

	describe('when there are existing parameters', () => {
		it('appends an encoded query parameter', () => {
			const input = '/test/path?otherParam=b%3A%2F%2Ftest+b';
			const output = addReturnUrlToPath(input, 'a:// test');
			const expected =
				'/test/path?otherParam=b%3A%2F%2Ftest+b&returnUrl=a%3A%2F%2F%20test';
			expect(output).toEqual(expected);
		});
	});
});
