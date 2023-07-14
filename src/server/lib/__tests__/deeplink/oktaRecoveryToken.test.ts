import { AppResponse } from '@/server/models/okta/App';
import { mocked } from 'jest-mock';
import {
	addAppPrefixToOktaRecoveryToken,
	extractOktaRecoveryToken,
} from '../../deeplink/oktaRecoveryToken';
import { getApp } from '../../okta/api/apps';

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
			groupIds: {
				GuardianUserAll: 'okta-guardian-users-group-id',
			},
		},
		aws: {
			instanceId: 'instanceId',
			kinesisStreamName: 'kinesisStreamName',
		},
	}),
}));

jest.mock('@/server/lib/serverSideLogger', () => ({
	logger: {
		error: jest.fn(),
	},
}));

jest.mock('@/server/lib/okta/api/apps');
const mockedGetApp = mocked<(id: string) => Promise<AppResponse>>(getApp);

describe('extractOktaRecoveryToken', () => {
	it('should return the token when there is no prefix', () => {
		const token = 'token';
		expect(extractOktaRecoveryToken(token)).toEqual(token);
	});

	it('should return the token when there is a prefix', () => {
		const input = 'al_token';
		const expected = 'token';
		expect(extractOktaRecoveryToken(input)).toEqual(expected);
	});

	it('should return the token when there is a prefix and multiple underscores', () => {
		const input = 'al_token_1_2_3';
		const expected = 'token_1_2_3';
		expect(extractOktaRecoveryToken(input)).toEqual(expected);
	});

	it('should only remove prefix from the start of the string', () => {
		const input = 'al_token_al_token';
		const expected = 'token_al_token';
		expect(extractOktaRecoveryToken(input)).toEqual(expected);
	});

	it('should not remove prefix from the middle of the string', () => {
		const input = 'token_al_token';
		const expected = 'token_al_token';
		expect(extractOktaRecoveryToken(input)).toEqual(expected);
	});
});

describe('addAppPrefixToOktaRecoveryToken', () => {
	it('should return the token when there is no appClientId', async () => {
		const token = 'token';
		const appClientId = undefined;

		expect(await addAppPrefixToOktaRecoveryToken(token, appClientId)).toEqual(
			token,
		);
	});

	it('should return the token when there is no app prefix', async () => {
		const token = 'token';
		const appClientId = 'appClientId';
		const app: AppResponse = {
			id: 'id',
			label: 'app_label',
			settings: {
				oauthClient: {
					redirect_uris: [],
				},
			},
		};

		mockedGetApp.mockResolvedValueOnce(app);

		expect(await addAppPrefixToOktaRecoveryToken(token, appClientId)).toEqual(
			token,
		);
	});

	it('should return the token when there is an app prefix android live', async () => {
		const token = 'token';
		const appClientId = 'appClientId';
		const app: AppResponse = {
			id: 'id',
			label: 'android_live_app',
			settings: {
				oauthClient: {
					redirect_uris: [],
				},
			},
		};

		mockedGetApp.mockResolvedValueOnce(app);

		expect(await addAppPrefixToOktaRecoveryToken(token, appClientId)).toEqual(
			`al_${token}`,
		);
	});

	it('should return the token when there is an app prefix ios live', async () => {
		const token = 'token';
		const appClientId = 'appClientId';
		const app: AppResponse = {
			id: 'id',
			label: 'ios_live_app',
			settings: {
				oauthClient: {
					redirect_uris: [],
				},
			},
		};

		mockedGetApp.mockResolvedValueOnce(app);

		expect(await addAppPrefixToOktaRecoveryToken(token, appClientId)).toEqual(
			`il_${token}`,
		);
	});

	it('should return the token if the appClientId is not found', async () => {
		const token = 'token';
		const appClientId = 'appClientId';

		mockedGetApp.mockRejectedValueOnce(new Error('App not found'));

		expect(await addAppPrefixToOktaRecoveryToken(token, appClientId)).toEqual(
			token,
		);
	});
});
