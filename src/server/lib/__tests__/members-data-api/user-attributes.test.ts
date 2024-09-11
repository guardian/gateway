import { getUserAttributes } from '../../members-data-api/user-attributes';
import { UserAttributesResponse } from '@/shared/lib/members-data-api';

jest.mock('@/server/lib/getConfiguration', () => ({
	getConfiguration: () => ({
		membersDataApiUrl: 'members-data-api-url',
	}),
}));

const mockedFetch = jest.spyOn(global, 'fetch');

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- jest mock
const json = jest.fn() as jest.MockedFunction<any>;

// mocked logger
jest.mock('@/server/lib/serverSideLogger', () => ({
	logger: {
		error: jest.fn(),
	},
}));

describe('mdapi#getUserAttributes - OAuth Access Token', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should return user attributes', async () => {
		const accessToken = '123';

		const userAttributesResponse: UserAttributesResponse = {
			contentAccess: {
				digitalPack: false,
				guardianPatron: false,
				guardianWeeklySubscriber: false,
				member: false,
				paidMember: false,
				paperSubscriber: false,
				recurringContributor: false,
				supporterPlus: false,
			},
			showSupportMessaging: false,
			userId: '123',
		};

		json.mockResolvedValueOnce(userAttributesResponse);
		const response = { ok: true, status: 200, json } as Response;
		mockedFetch.mockReturnValueOnce(Promise.resolve(response));

		const result = await getUserAttributes({ accessToken });

		expect(result).toEqual(userAttributesResponse);
	});

	test('should return undefined if response is not ok', async () => {
		const accessToken = '123';

		const response = {
			ok: false,
			status: 404,
		} as Response;

		mockedFetch.mockReturnValueOnce(Promise.resolve(response));

		const result = await getUserAttributes({ accessToken });

		expect(result).toBeUndefined();
	});

	test('should return undefined if response is invalid', async () => {
		const accessToken = '123';

		const userAttributesResponse = {
			contentAccess: {
				guardianPatron: false,
				guardianWeeklySubscriber: false,
				member: false,
				paidMember: false,
				paperSubscriber: false,
				supporterPlus: false,
			},
			userId: '123',
		};

		json.mockResolvedValueOnce(userAttributesResponse);
		const response = { ok: true, status: 200, json } as Response;
		mockedFetch.mockReturnValueOnce(Promise.resolve(response));

		const result = await getUserAttributes({ accessToken });

		expect(result).toBeUndefined();
	});
});
