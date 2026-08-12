import { Request } from 'express';
import { getOpenIdClient } from '@/server/lib/okta/openid-connect';
import {
	authorizationCodeGrant,
	buildAuthorizationUrl,
	customFetch,
	refreshTokenGrant,
} from 'openid-client';

jest.mock('@/server/lib/getConfiguration', () => ({
	getConfiguration: () => ({
		okta: {
			orgUrl: 'https://example.okta.com',
			authServerId: 'default',
			clientId: 'gateway-client-id',
			clientSecret: 'gateway-client-secret',
		},
		baseUri: 'profile.theguardian.com',
		stage: 'CODE',
	}),
}));

jest.mock('@/server/lib/getProfileUrl', () => ({
	getProfileUrl: () => 'https://profile.theguardian.com',
}));

jest.mock('openid-client', () => {
	const customFetchSymbol = Symbol('customFetch');

	return {
		customFetch: customFetchSymbol,
		allowInsecureRequests: jest.fn(),
		Configuration: class {
			serverMetadata: unknown;
			clientId: string;
			metadata: unknown;
			[customFetchSymbol]?: (
				url: URL | string,
				options?: RequestInit,
			) => Promise<Response>;

			constructor(
				serverMetadata: unknown,
				clientId: string,
				metadata: unknown,
			) {
				this.serverMetadata = serverMetadata;
				this.clientId = clientId;
				this.metadata = metadata;
			}
		},
		buildAuthorizationUrl: jest.fn(
			(_: unknown, params: URLSearchParams) =>
				new URL(
					`https://example.okta.com/oauth2/v1/authorize?${params.toString()}`,
				),
		),
		authorizationCodeGrant: jest.fn(),
		refreshTokenGrant: jest.fn(),
	};
});

describe('okta openid-connect v6 compatibility layer', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('authorizationUrl filters undefined values before calling openid-client', () => {
		const req = {
			ip: '127.0.0.1',
			get: () => undefined,
		} as unknown as Request;
		const openIdClient = getOpenIdClient(req);

		const url = openIdClient.authorizationUrl({
			state: 'abc123',
			sessionToken: undefined,
			scope: 'openid profile',
		});

		expect(buildAuthorizationUrl).toHaveBeenCalledTimes(1);
		const [, params] = (buildAuthorizationUrl as jest.Mock).mock.calls[0] as [
			unknown,
			URLSearchParams,
		];

		expect(params.get('state')).toBe('abc123');
		expect(params.get('scope')).toBe('openid profile');
		expect(params.has('sessionToken')).toBe(false);
		expect(url).toContain('state=abc123');
	});

	test('callbackParams keeps only string query values', () => {
		const req = {
			ip: '127.0.0.1',
			get: () => undefined,
			query: {
				code: 'auth-code',
				state: ['state-value', 'secondary-state'],
				error_description: 'oauth_error',
				ignored: 42,
			},
		} as unknown as Request;
		const openIdClient = getOpenIdClient(req);

		expect(openIdClient.callbackParams(req)).toEqual({
			code: 'auth-code',
			error_description: 'oauth_error',
		});
	});

	test('callback and refresh preserve claims() helper semantics', async () => {
		const tokenClaims = { sub: 'reader-id' };
		const claims = jest.fn().mockReturnValue(tokenClaims);

		(authorizationCodeGrant as jest.Mock).mockResolvedValue({
			access_token: 'access-token',
			id_token: 'id-token',
			claims,
		});
		(refreshTokenGrant as jest.Mock).mockResolvedValue({
			access_token: 'new-access-token',
			id_token: 'new-id-token',
			claims,
		});

		const req = {
			ip: '127.0.0.1',
			get: () => undefined,
		} as unknown as Request;
		const openIdClient = getOpenIdClient(req);

		const callbackResult = await openIdClient.callback(
			'https://profile.theguardian.com/oauth/authorization-code/callback',
			{ code: 'abc', state: 'state-value' },
			{ state: 'state-value', code_verifier: 'pkce-verifier' },
		);
		const refreshResult = await openIdClient.refresh('refresh-token');

		expect(callbackResult.claims()).toEqual(tokenClaims);
		expect(refreshResult.claims()).toEqual(tokenClaims);
		expect(claims).toHaveBeenCalledTimes(2);
		expect(authorizationCodeGrant).toHaveBeenCalledWith(
			expect.anything(),
			expect.any(URL),
			{
				pkceCodeVerifier: 'pkce-verifier',
				expectedState: 'state-value',
			},
		);
	});

	test('claims() throws when id_token is absent', async () => {
		(authorizationCodeGrant as jest.Mock).mockResolvedValue({
			access_token: 'access-token',
			// no id_token, no claims helper
		});

		const req = {
			ip: '127.0.0.1',
			get: () => undefined,
		} as unknown as Request;
		const openIdClient = getOpenIdClient(req);

		const result = await openIdClient.callback(
			'https://profile.theguardian.com/oauth/authorization-code/callback',
			{ code: 'abc', state: 'state-value' },
			{ state: 'state-value' },
		);

		expect(() => result.claims()).toThrow(
			'id_token not present in token response',
		);
	});

	test('adds X-Forwarded-For header to openid-client requests when ip is present', async () => {
		const fetchMock = jest
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(new Response(null, { status: 200 }));

		const req = {
			ip: '203.0.113.10',
			get: () => undefined,
		} as unknown as Request;
		const openIdClient = getOpenIdClient(req);
		openIdClient.authorizationUrl({ state: 'abc' });

		const [config] = (buildAuthorizationUrl as jest.Mock).mock.calls[0] as [
			Record<
				symbol,
				(url: URL | string, options?: RequestInit) => Promise<Response>
			>,
			URLSearchParams,
		];
		await config[customFetch]('https://example.okta.com/oauth2/v1/token', {
			headers: { Authorization: 'Bearer existing-token' },
		});

		expect(fetchMock).toHaveBeenCalledWith(
			'https://example.okta.com/oauth2/v1/token',
			expect.objectContaining({
				headers: expect.objectContaining({
					authorization: 'Bearer existing-token',
					'X-Forwarded-For': '203.0.113.10',
				}),
			}),
		);

		fetchMock.mockRestore();
	});
});
