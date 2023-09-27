import { getCurrentSession } from '@/server/lib/okta/api/sessions';
import { OktaError } from '@/server/models/okta/Error';

const sessionId = '123';

// mocked configuration
jest.mock('@/server/lib/getConfiguration', () => ({
	getConfiguration: () => ({
		okta: {
			enabled: true,
			orgUrl: 'someOrgUrl',
			token: 'token',
			authServerId: 'authServerId',
			clientId: 'clientId',
			clientSecret: 'clientSecret',
		},
	}),
}));

const mockedFetch = jest.spyOn(global, 'fetch');

/* eslint-disable @typescript-eslint/no-explicit-any */
const json = jest.fn() as jest.MockedFunction<any>;

describe('okta#signOutUser', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should sign out a user given a current valid session - Okta Identity Classic (`sid` cookie)', async () => {
		const sessionData = {
			id: '123',
			login: 'email@example.com',
			userId: '123',
			expiresAt: '2016-01-03T09:13:17.000Z',
			status: 'ACTIVE',
			lastPasswordVerification: '2016-01-03T07:02:00.000Z',
		};

		json.mockResolvedValueOnce(sessionData);
		mockedFetch.mockReturnValueOnce(
			Promise.resolve({ ok: true, status: 200, json } as Response),
		);

		const sessionResponse = await getCurrentSession({ sid: sessionId });
		expect(sessionResponse).toEqual(sessionData);
	});

	test('should throw an error after invalid session response from Okta', async () => {
		mockedFetch.mockReturnValueOnce(
			Promise.resolve({ ok: false, status: 404 } as Response),
		);

		await expect(getCurrentSession({ sid: sessionId })).rejects.toThrowError(
			new OktaError({ message: 'Could not parse Okta error response' }),
		);
	});

	test('should sign out a user given a current valid session - Okta Identity Engine (`idx` cookie)', async () => {
		const sessionData = {
			id: '123',
			login: 'email@example.com',
			userId: '123',
			expiresAt: '2016-01-03T09:13:17.000Z',
			status: 'ACTIVE',
			lastPasswordVerification: '2016-01-03T07:02:00.000Z',
		};

		json.mockResolvedValueOnce(sessionData);
		mockedFetch.mockReturnValueOnce(
			Promise.resolve({ ok: true, status: 200, json } as Response),
		);

		const sessionResponse = await getCurrentSession({ sid: sessionId });
		expect(sessionResponse).toEqual(sessionData);
	});

	test('should throw an error after invalid session response from Okta', async () => {
		mockedFetch.mockReturnValueOnce(
			Promise.resolve({ ok: false, status: 404 } as Response),
		);

		await expect(getCurrentSession({ sid: sessionId })).rejects.toThrowError(
			new OktaError({ message: 'Could not parse Okta error response' }),
		);
	});

	test('should sign out a user given a current valid session - `idx` cookie & `sid` cookie', async () => {
		const sessionData = {
			id: '123',
			login: 'email@example.com',
			userId: '123',
			expiresAt: '2016-01-03T09:13:17.000Z',
			status: 'ACTIVE',
			lastPasswordVerification: '2016-01-03T07:02:00.000Z',
		};

		json.mockResolvedValueOnce(sessionData);
		mockedFetch.mockReturnValueOnce(
			Promise.resolve({ ok: true, status: 200, json } as Response),
		);

		const sessionResponse = await getCurrentSession({
			sid: sessionId,
			idx: sessionId,
		});
		expect(sessionResponse).toEqual(sessionData);
	});

	test('should throw an error after invalid session response from Okta', async () => {
		mockedFetch.mockReturnValueOnce(
			Promise.resolve({ ok: false, status: 404 } as Response),
		);

		await expect(getCurrentSession({ sid: sessionId })).rejects.toThrowError(
			new OktaError({ message: 'Could not parse Okta error response' }),
		);
	});
});
