import { UserBenefitsResponse } from '@/shared/lib/user-benefits-api';
import {
	getUserBenefits,
	translateDataFromUserBenefitsApi,
} from '../../user-benefits-api/user-benefits';

jest.mock('@/server/lib/serverSideLogger', () => ({
	logger: {
		warn: jest.fn(),
		error: jest.fn(),
		info: jest.fn(),
	},
}));

jest.mock('@/server/lib/getConfiguration', () => ({
	getConfiguration: jest.fn(() => ({
		userBenefitsApiUrl: 'https://mock-api.com',
	})),
}));

describe('user-benefits', () => {
	describe('translateDataFromUserBenefitsApi', () => {
		test('should return a fully populated UserBenefitsSchema when all valid benefits are present', () => {
			const input: UserBenefitsResponse = {
				benefits: ['hideSupportMessaging', 'adFree', 'allowRejectAll'],
			};

			const expected = {
				hideSupportMessaging: true,
				adFree: true,
				allowRejectAll: true,
			};

			const output = translateDataFromUserBenefitsApi(input);

			expect(output).toEqual(expected);
		});

		test('should ignore unknown benefits and return a valid UserBenefitsSchema', () => {
			const input: UserBenefitsResponse = {
				benefits: [
					'hideSupportMessaging',
					'adFree',
					'allowRejectAll',
					'otherBenefit',
					'anotherBenefit',
				],
			};

			const expected = {
				hideSupportMessaging: true,
				adFree: true,
				allowRejectAll: true,
			};

			const output = translateDataFromUserBenefitsApi(input);

			expect(output).toEqual(expected);
		});

		test('should return a partially populated object when only some valid benefits are present', () => {
			const input: UserBenefitsResponse = {
				benefits: ['allowRejectAll', 'hideSupportMessaging'],
			};

			const expected = {
				hideSupportMessaging: true,
				adFree: false,
				allowRejectAll: true,
			};

			const output = translateDataFromUserBenefitsApi(input);

			expect(output).toEqual(expected);
		});

		test('should return an object with all benefits set to false when the benefits array is empty', () => {
			const input: UserBenefitsResponse = {
				benefits: [],
			};

			const expected = {
				hideSupportMessaging: false,
				adFree: false,
				allowRejectAll: false,
			};

			const output = translateDataFromUserBenefitsApi(input);

			expect(output).toEqual(expected);
		});
	});

	describe('getUserBenefits', () => {
		const mockAccessToken = 'mockAccessToken';
		beforeEach(() => {
			jest.spyOn(global, 'fetch');
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		test('should return parsed user benefits on successful API call', async () => {
			const mockResponse = {
				benefits: ['adFree', 'allowRejectAll'],
			};

			const expected = {
				hideSupportMessaging: false,
				adFree: true,
				allowRejectAll: true,
			};

			(global.fetch as jest.Mock).mockResolvedValueOnce(
				new Response(JSON.stringify(mockResponse), {
					status: 200,
					statusText: 'OK',
					headers: { 'Content-Type': 'application/json' },
				}),
			);

			const result = await getUserBenefits({ accessToken: mockAccessToken });

			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('/benefits/me'),
				expect.objectContaining({
					method: 'GET',
					headers: expect.any(Headers),
				}),
			);

			expect(result).toEqual(expected);
		});

		test('should return undefined when API response is not ok', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce(
				new Response(null, {
					status: 403,
				}),
			);

			const result = await getUserBenefits({ accessToken: mockAccessToken });

			expect(global.fetch).toHaveBeenCalled();
			expect(result).toBeUndefined();
		});
	});
});
