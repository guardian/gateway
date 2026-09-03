import { Request } from 'express';
import { getOpenIdClient } from '@/server/lib/okta/openid-connect';
import {
	authorizationCodeGrant,
	buildAuthorizationUrl,
	customFetch,
	refreshTokenGrant,
	allowInsecureRequests,
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

	test('full authorization → callback → refresh flow with matching state and PKCE', async () => {
		const req = {
			ip: '10.0.0.1',
			get: () => undefined,
		} as unknown as Request;
		const client = getOpenIdClient(req);

		// Step 1 – build the authorization URL
		const authUrl = client.authorizationUrl({
			state: 'csrf-state-xyz',
			code_challenge: 'challenge-abc',
			code_challenge_method: 'S256',
			scope: 'openid profile email',
			redirect_uri:
				'https://profile.theguardian.com/oauth/authorization-code/callback',
		});

		expect(buildAuthorizationUrl).toHaveBeenCalledTimes(1);
		expect(authUrl).toContain('state=csrf-state-xyz');
		expect(authUrl).toContain('code_challenge=challenge-abc');

		// Step 2 – exchange the authorization code
		const tokenClaims = { sub: 'user-123', email: 'user@example.com' };
		const claimsFn = jest.fn().mockReturnValue(tokenClaims);
		const mockAccessToken = 'access-token-step2';
		const mockRefreshToken = 'refresh-token-step2';

		(authorizationCodeGrant as jest.Mock).mockResolvedValue({
			access_token: mockAccessToken,
			id_token: 'id-token-step2',
			refresh_token: mockRefreshToken,
			claims: claimsFn,
		});

		const callbackResult = await client.callback(
			'https://profile.theguardian.com/oauth/authorization-code/callback',
			{ code: 'auth-code-123', state: 'csrf-state-xyz' },
			{ state: 'csrf-state-xyz', code_verifier: 'pkce-verifier-xyz' },
		);

		expect(authorizationCodeGrant).toHaveBeenCalledWith(
			expect.anything(),
			expect.any(URL),
			{
				pkceCodeVerifier: 'pkce-verifier-xyz',
				expectedState: 'csrf-state-xyz',
			},
		);
		expect(callbackResult.access_token).toBe(mockAccessToken);
		expect(callbackResult.refresh_token).toBe(mockRefreshToken);
		expect(callbackResult.claims()).toEqual(tokenClaims);

		// Step 3 – refresh using the token obtained in step 2
		const newAccessToken = 'access-token-step3';
		(refreshTokenGrant as jest.Mock).mockResolvedValue({
			access_token: newAccessToken,
			id_token: 'id-token-step3',
			claims: claimsFn,
		});

		const refreshResult = await client.refresh(mockRefreshToken);

		expect(refreshTokenGrant).toHaveBeenCalledWith(
			expect.anything(),
			mockRefreshToken,
		);
		expect(refreshResult.access_token).toBe(newAccessToken);
		expect(refreshResult.claims()).toEqual(tokenClaims);
	});

	test('full application-token flow: callback without PKCE, then refresh', async () => {
		// Some OAuth flows (e.g. application-callback) do not use PKCE.
		// Confirm that code_verifier being absent maps to pkceCodeVerifier: undefined.
		const claimsFn = jest.fn().mockReturnValue({ sub: 'app-user' });

		(authorizationCodeGrant as jest.Mock).mockResolvedValue({
			access_token: 'app-access-token',
			id_token: 'app-id-token',
			refresh_token: 'app-refresh-token',
			claims: claimsFn,
		});

		const req = {
			ip: '10.0.0.2',
			get: () => undefined,
		} as unknown as Request;
		const client = getOpenIdClient(req);

		const callbackResult = await client.callback(
			'https://profile.theguardian.com/oauth/authorization-code/application-callback',
			{ code: 'app-code', state: 'app-state' },
			{ state: 'app-state' }, // no code_verifier → no PKCE
		);

		expect(authorizationCodeGrant).toHaveBeenCalledWith(
			expect.anything(),
			expect.any(URL),
			{ pkceCodeVerifier: undefined, expectedState: 'app-state' },
		);
		expect(callbackResult.access_token).toBe('app-access-token');

		// Refresh the application token
		(refreshTokenGrant as jest.Mock).mockResolvedValue({
			access_token: 'app-new-access-token',
			id_token: 'app-new-id-token',
			claims: claimsFn,
		});

		const refreshResult = await client.refresh('app-refresh-token');

		expect(refreshTokenGrant).toHaveBeenCalledWith(
			expect.anything(),
			'app-refresh-token',
		);
		expect(refreshResult.access_token).toBe('app-new-access-token');
	});

	test('application callback rejects when PKCE verifier is wrong', async () => {
		(authorizationCodeGrant as jest.Mock).mockRejectedValue(
			new Error('PKCE verification failed'),
		);

		const req = {
			ip: '10.0.0.4',
			get: () => undefined,
		} as unknown as Request;
		const client = getOpenIdClient(req);

		await expect(
			client.callback(
				'https://profile.theguardian.com/oauth/authorization-code/application-callback',
				{ code: 'app-code', state: 'app-state' },
				{ state: 'app-state', code_verifier: 'wrong-verifier' },
			),
		).rejects.toThrow('PKCE verification failed');

		expect(authorizationCodeGrant).toHaveBeenCalledWith(
			expect.anything(),
			expect.any(URL),
			{ pkceCodeVerifier: 'wrong-verifier', expectedState: 'app-state' },
		);
		expect(refreshTokenGrant).not.toHaveBeenCalled();
	});

	// This is deprecated, but there doesn't seem to be a direct replacement to do unsafe http in v6.
	test('allowInsecureRequests is NOT called for a production HTTPS issuer', () => {
		const req = {
			ip: '127.0.0.1',
			get: () => undefined,
		} as unknown as Request;

		getOpenIdClient(req).authorizationUrl({ state: 'test' });

		expect(allowInsecureRequests).not.toHaveBeenCalled();
	});
});
