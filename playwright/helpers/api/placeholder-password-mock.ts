import { APIRequestContext } from '@playwright/test';

export const dangerouslySetPlaceholderPasswordMocks = async (
	mockApi: APIRequestContext,
	email: string,
) => {
	await Promise.all([
		mockApi.post('/mock/permanent-pattern', {
			data: {
				pattern: '/api/v1/users/.*/lifecycle/reset_password',
				status: 200,
				body: {
					resetPasswordUrl: `https://profile.thegulocal.com/reset_password/token_token_token_to`,
					activationUrl: `token_token_token_to`,
					activationToken: `token_token_token_to`,
				},
			},
		}),
		mockApi.post('/mock/permanent', {
			data: {
				path: '/api/v1/authn/recovery/token',
				status: 200,
				body: {
					stateToken: 'stateToken',
					expiresAt: new Date(Date.now() + 1800000 /* 30 mins */),
					status: 'SUCCESS',
					_embedded: {
						user: {
							id: '12345',
							passwordChanged: new Date().toISOString(),
							profile: {
								login: email,
								firstName: null,
								lastName: null,
							},
						},
					},
				},
			},
		}),
		mockApi.post('/mock/permanent', {
			data: {
				path: '/api/v1/authn/credentials/reset_password',
				status: 200,
				body: {
					expiresAt: new Date(Date.now() + 1800000 /* 30 mins */),
					status: 'SUCCESS',
					sessionToken: 'aValidSessionToken',
					_embedded: {
						user: {
							id: '12345',
							passwordChanged: new Date().toISOString(),
							profile: {
								login: email,
								firstName: null,
								lastName: null,
								locale: 'en_US',
								timeZone: 'America/Los_Angeles',
							},
						},
					},
				},
			},
		}),
		mockApi.post('/mock/permanent-pattern', {
			data: {
				pattern: '/api/v1/users/[^/]+$',
				status: 200,
				body: {
					id: '12345',
					status: 'SUCCESS',
					profile: {
						login: email,
						email,
						isGuardianUser: true,
					},
					credentials: {},
				},
			},
		}),
	]);
};
