import { getUserBenefits } from '../../user-benefits-api/user-benefits';

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
				benefits: ['adFree', 'allowRejectAll'],
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

		test('should filter out undefined user benefits on successful API call', async () => {
			const mockResponse = {
				benefits: ['adFree', 'allowRejectAll', 'unknownBenefit'],
			};

			const expected = {
				benefits: ['adFree', 'allowRejectAll'],
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
