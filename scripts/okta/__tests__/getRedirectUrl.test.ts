import { getRedirectUrl } from '../lib/helper';

describe('getRedirectUrl', () => {
	it('should return /signin if no valid params passed', () => {
		expect(getRedirectUrl('', '', '', {})).toBe(`/signin?`);
	});

	it('should return /welcome/:token if no valid params passed but the activation_token', () => {
		expect(getRedirectUrl('?activation_token=123', '', '', {})).toBe(
			`/welcome/123?`,
		);
	});

	it('should return /signin with valid query params - identity classic', () => {
		expect(
			getRedirectUrl('', '', '', {
				getRequestContext: () => ({
					target: {
						clientId: 'test123',
						label: 'testabc',
					},
				}),
				getSignInWidgetConfig: () => ({
					relayState: '/testFromURI',
				}),
			}),
		).toBe('/signin?fromURI=%2FtestFromURI&appClientId=test123');
	});

	it('should return /signin with valid query params - identity engine', () => {
		expect(
			getRedirectUrl('', '', '', {
				getRequestContext: () => ({
					app: {
						value: {
							id: 'test123',
							label: 'testabc',
						},
					},
				}),
				getSignInWidgetConfig: () => ({
					relayState: '/testFromURI',
				}),
			}),
		).toBe('/signin?fromURI=%2FtestFromURI&appClientId=test123');
	});

	it('should return /welcome/:token with valid query params and activation_token - identity classic', () => {
		expect(
			getRedirectUrl('?activation_token=123', '', '', {
				getRequestContext: () => ({
					target: {
						clientId: 'test123',
						label: 'testabc',
					},
				}),
				getSignInWidgetConfig: () => ({
					relayState: '/testFromURI',
				}),
			}),
		).toBe('/welcome/123?fromURI=%2FtestFromURI&appClientId=test123');
	});

	it('should return /welcome/:token with valid query params and activation_token - identity engine', () => {
		expect(
			getRedirectUrl('?activation_token=123', '', '', {
				getRequestContext: () => ({
					app: {
						value: {
							id: 'test123',
							label: 'testabc',
						},
					},
				}),
				getSignInWidgetConfig: () => ({
					relayState: '/testFromURI',
				}),
			}),
		).toBe('/welcome/123?fromURI=%2FtestFromURI&appClientId=test123');
	});

	it('should return /signin with valid query params and third party return url and third party client id - identity classic', () => {
		expect(
			getRedirectUrl('', 'https://profile.theguardian.com', '', {
				getRequestContext: () => ({
					target: {
						clientId: 'test123',
						label: 'jobs_site',
					},
				}),
				getSignInWidgetConfig: () => ({
					relayState: '/testFromURI',
				}),
			}),
		).toBe(
			'/signin?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com',
		);
	});

	it('should return /signin with valid query params and third party return url and third party client id - identity engine', () => {
		expect(
			getRedirectUrl('', 'https://profile.theguardian.com', '', {
				getRequestContext: () => ({
					app: {
						value: {
							id: 'test123',
							label: 'jobs_site',
						},
					},
				}),
				getSignInWidgetConfig: () => ({
					relayState: '/testFromURI',
				}),
			}),
		).toBe(
			'/signin?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com',
		);
	});

	it('should return /welcome/:token with valid query params and third party return url and third party client id - identity classic', () => {
		expect(
			getRedirectUrl(
				'?activation_token=123',
				'https://profile.theguardian.com',
				'',
				{
					getRequestContext: () => ({
						target: {
							clientId: 'test123',
							label: 'jobs_site',
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
				},
			),
		).toBe(
			'/welcome/123?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com',
		);
	});

	it('should return /welcome/:token with valid query params and third party return url and third party client id - identity engine', () => {
		expect(
			getRedirectUrl(
				'?activation_token=123',
				'https://profile.theguardian.com',
				'',
				{
					getRequestContext: () => ({
						app: {
							value: {
								id: 'test123',
								label: 'jobs_site',
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
				},
			),
		).toBe(
			'/welcome/123?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com',
		);
	});

	it('should return /reset-password/:token with valid query params and third party return url and third party client id - identity classic', () => {
		expect(
			getRedirectUrl(
				'?reset_password_token=123',
				'https://profile.theguardian.com',
				'',
				{
					getRequestContext: () => ({
						target: {
							clientId: 'test123',
							label: 'jobs_site',
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
				},
			),
		).toBe(
			'/reset-password/123?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com',
		);
	});

	it('should return /reset-password/:token with valid query params and third party return url and third party client id - identity engine', () => {
		expect(
			getRedirectUrl(
				'?reset_password_token=123',
				'https://profile.theguardian.com',
				'',
				{
					getRequestContext: () => ({
						app: {
							value: {
								id: 'test123',
								label: 'jobs_site',
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
				},
			),
		).toBe(
			'/reset-password/123?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com',
		);
	});

	it('should return /set-password/:token with valid query params and third party return url and third party client id - identity classic', () => {
		expect(
			getRedirectUrl(
				'?set_password_token=123',
				'https://profile.theguardian.com',
				'',
				{
					getRequestContext: () => ({
						target: {
							clientId: 'test123',
							label: 'jobs_site',
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
				},
			),
		).toBe(
			'/set-password/123?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com',
		);
	});

	it('should return /set-password/:token with valid query params and third party return url and third party client id - identity engine', () => {
		expect(
			getRedirectUrl(
				'?set_password_token=123',
				'https://profile.theguardian.com',
				'',
				{
					getRequestContext: () => ({
						app: {
							value: {
								id: 'test123',
								label: 'jobs_site',
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
				},
			),
		).toBe(
			'/set-password/123?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com',
		);
	});

	it('should return /signin only with clientId if force_fallback is set - identity classic', () => {
		expect(
			getRedirectUrl(
				'?force_fallback=true&client_id=test123',
				'https://profile.theguardian.com',
				'',
				{
					getRequestContext: () => ({
						target: {
							clientId: 'test123',
							label: 'jobs_site',
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
				},
			),
		).toBe('/signin?appClientId=test123');
	});

	it('should return /signin only with clientId if force_fallback is set - identity engine', () => {
		expect(
			getRedirectUrl(
				'?force_fallback=true&client_id=test123',
				'https://profile.theguardian.com',
				'',
				{
					getRequestContext: () => ({
						app: {
							value: {
								id: 'test123',
								label: 'jobs_site',
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
				},
			),
		).toBe('/signin?appClientId=test123');
	});

	it('should return /welcome/:token only with clientId if force_fallback is set - identity classic', () => {
		expect(
			getRedirectUrl(
				'?force_fallback=true&client_id=test123&activation_token=123',
				'https://profile.theguardian.com',
				'',
				{
					getRequestContext: () => ({
						target: {
							clientId: 'test123',
							label: 'jobs_site',
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
				},
			),
		).toBe('/welcome/123?appClientId=test123');
	});

	it('should return /welcome/:token only with clientId if force_fallback is set - identity engine', () => {
		expect(
			getRedirectUrl(
				'?force_fallback=true&client_id=test123&activation_token=123',
				'https://profile.theguardian.com',
				'',
				{
					getRequestContext: () => ({
						app: {
							value: {
								id: 'test123',
								label: 'jobs_site',
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
				},
			),
		).toBe('/welcome/123?appClientId=test123');
	});

	it('should get fromURI from location and queryparams if path starts with /oauth2/ and fromURI is not in the okta config - identity classic', () => {
		expect(
			getRedirectUrl(
				'?client_id=test123&prompt=login',
				'https://profile.theguardian.com',
				'/oauth2/v1/authorize',
				{
					getRequestContext: () => ({
						target: {
							clientId: 'test123',
							label: 'jobs_site',
						},
					}),
					getSignInWidgetConfig: () => ({}),
				},
			),
		).toBe(
			'/signin?fromURI=%2Foauth2%2Fv1%2Fauthorize%3Fclient_id%3Dtest123&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com',
		);
	});

	it('should get fromURI from location and queryparams if path starts with /oauth2/ and fromURI is not in the okta config - identity engine', () => {
		expect(
			getRedirectUrl(
				'?client_id=test123&prompt=login',
				'https://profile.theguardian.com',
				'/oauth2/v1/authorize',
				{
					getRequestContext: () => ({
						app: {
							value: {
								id: 'test123',
								label: 'jobs_site',
							},
						},
					}),
					getSignInWidgetConfig: () => ({}),
				},
			),
		).toBe(
			'/signin?fromURI=%2Foauth2%2Fv1%2Fauthorize%3Fclient_id%3Dtest123&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com',
		);
	});
});
