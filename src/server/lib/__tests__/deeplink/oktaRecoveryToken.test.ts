import { mocked } from 'jest-mock';
import {
	addAppPrefixToOktaRecoveryToken,
	decryptOktaRecoveryToken,
	encryptOktaRecoveryToken,
	extractOktaRecoveryToken,
} from '@/server/lib/deeplink/oktaRecoveryToken';
import { getApp } from '@/server/lib/okta/api/apps';
import type { AppResponse } from '@/server/models/okta/App';

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
		// valid encryption key, only used for testing, hence safe to hardcode
		encryptionSecretKey:
			'f3d87b231ddd6f50d99e227c5bc9b7cbb649387b321008df412fd73805ac2e32',
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

describe('encryptOktaRecoveryToken', () => {
	it('should encrypt the token', async () => {
		const token = 'token';
		const output = await encryptOktaRecoveryToken({
			token,
		});

		const [decryptedToken, decryptedEncryptedRegistrationConsents] =
			decryptOktaRecoveryToken({ encryptedToken: output });

		expect(output).not.toBe(token);
		expect(decryptedToken).toBe(token);
		expect(decryptedEncryptedRegistrationConsents).toBeUndefined();
	});

	it('should encrypt the token and encrypted registration consents', async () => {
		const token = 'token';
		const encryptedRegistrationConsents = 'encryptedRegistrationConsents';
		const output = await encryptOktaRecoveryToken({
			token,
			encryptedRegistrationConsents,
		});

		const [decryptedToken, decryptedEncryptedRegistrationConsents] =
			decryptOktaRecoveryToken({ encryptedToken: output });

		expect(output).not.toBe(token);
		expect(output).not.toBe(encryptedRegistrationConsents);
		expect(decryptedToken).toBe(token);
		expect(decryptedEncryptedRegistrationConsents).toBe(
			encryptedRegistrationConsents,
		);
	});

	it('should encrypt the token and encrypted registration consents and add app prefix', async () => {
		const token = 'token';
		const encryptedRegistrationConsents = 'encryptedRegistrationConsents';
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

		const output = await encryptOktaRecoveryToken({
			token,
			encryptedRegistrationConsents,
			appClientId,
		});

		const [decryptedToken, decryptedEncryptedRegistrationConsents] =
			decryptOktaRecoveryToken({ encryptedToken: output });

		expect(output.startsWith('al_')).toBe(true);
		expect(output).not.toBe(token);
		expect(output).not.toBe(encryptedRegistrationConsents);
		expect(decryptedToken).toBe(token);
		expect(decryptedEncryptedRegistrationConsents).toBe(
			encryptedRegistrationConsents,
		);
	});
});

describe('decryptOktaRecoveryToken', () => {
	it('should decrypt the token', async () => {
		const token = 'token';
		const encryptedToken = await encryptOktaRecoveryToken({
			token,
		});

		const [decryptedToken, decryptedEncryptedRegistrationConsents] =
			decryptOktaRecoveryToken({ encryptedToken });

		expect(decryptedToken).toBe(token);
		expect(decryptedEncryptedRegistrationConsents).toBeUndefined();
	});

	it('should decrypt the token and encrypted registration consents', async () => {
		const token = 'token';
		const encryptedRegistrationConsents = 'encryptedRegistrationConsents';
		const encryptedToken = await encryptOktaRecoveryToken({
			token,
			encryptedRegistrationConsents,
		});

		const [decryptedToken, decryptedEncryptedRegistrationConsents] =
			decryptOktaRecoveryToken({ encryptedToken });

		expect(decryptedToken).toBe(token);
		expect(decryptedEncryptedRegistrationConsents).toBe(
			encryptedRegistrationConsents,
		);
	});

	it('should decrypt the token and encrypted registration consents and remove app prefix', async () => {
		const token = 'token';
		const encryptedRegistrationConsents = 'encryptedRegistrationConsents';
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

		const encryptedToken = await encryptOktaRecoveryToken({
			token,
			encryptedRegistrationConsents,
			appClientId,
		});

		expect(encryptedToken.startsWith('al_')).toBe(true);

		const [decryptedToken, decryptedEncryptedRegistrationConsents] =
			decryptOktaRecoveryToken({ encryptedToken });

		expect(decryptedToken).toBe(token);
		expect(decryptedEncryptedRegistrationConsents).toBe(
			encryptedRegistrationConsents,
		);
	});

	it('should return token if decryption fails', () => {
		const token = 'token';

		const [decryptedToken, decryptedEncryptedRegistrationConsents] =
			decryptOktaRecoveryToken({ encryptedToken: token });

		expect(decryptedToken).toBe(token);
		expect(decryptedEncryptedRegistrationConsents).toBeUndefined();
	});
});
