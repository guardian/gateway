import { getRedirectUrl } from '../lib/helper';

describe('getRedirectUrl', () => {
	it('should return /signin if no valid params passed', () => {
		expect(
			getRedirectUrl(new URLSearchParams(), '', '', {
				getRequestContext: () => ({}),
				getSignInWidgetConfig: () => ({}),
				completeLogin: () => {},
			}),
		).toBe(`/signin?`);
	});

	it('should return /welcome/:token if no valid params passed but the activation_token', () => {
		expect(
			getRedirectUrl(new URLSearchParams('?activation_token=123'), '', '', {
				getRequestContext: () => ({}),
				getSignInWidgetConfig: () => ({}),
				completeLogin: () => {},
			}),
		).toBe(`/welcome/123?`);
	});

	it('should return /signin with valid query params - identity classic', () => {
		expect(
			getRedirectUrl(new URLSearchParams(), '', '', {
				getRequestContext: () => ({
					target: {
						clientId: 'test123',
						label: 'testabc',
					},
					authentication: {
						request: {
							max_age: 100,
						},
					},
				}),
				getSignInWidgetConfig: () => ({
					relayState: '/testFromURI',
				}),
				completeLogin: () => {},
			}),
		).toBe('/signin?fromURI=%2FtestFromURI&appClientId=test123&maxAge=100');
	});

	it('should return /signin with valid query params - identity engine', () => {
		expect(
			getRedirectUrl(new URLSearchParams(), '', '', {
				getRequestContext: () => ({
					app: {
						value: {
							id: 'test123',
							label: 'testabc',
						},
					},
					authentication: {
						request: {
							max_age: 100,
						},
					},
				}),
				getSignInWidgetConfig: () => ({
					relayState: '/testFromURI',
				}),
				completeLogin: () => {},
			}),
		).toBe('/signin?fromURI=%2FtestFromURI&appClientId=test123&maxAge=100');
	});

	it('should return /welcome/:token with valid query params and activation_token - identity classic', () => {
		expect(
			getRedirectUrl(new URLSearchParams('?activation_token=123'), '', '', {
				getRequestContext: () => ({
					target: {
						clientId: 'test123',
						label: 'testabc',
					},
					authentication: {
						request: {
							max_age: 100,
						},
					},
				}),
				getSignInWidgetConfig: () => ({
					relayState: '/testFromURI',
				}),
				completeLogin: () => {},
			}),
		).toBe(
			'/welcome/123?fromURI=%2FtestFromURI&appClientId=test123&maxAge=100',
		);
	});

	it('should return /welcome/:token with valid query params and activation_token - identity engine', () => {
		expect(
			getRedirectUrl(new URLSearchParams('?activation_token=123'), '', '', {
				getRequestContext: () => ({
					app: {
						value: {
							id: 'test123',
							label: 'testabc',
						},
					},
					authentication: {
						request: {
							max_age: 100,
						},
					},
				}),
				getSignInWidgetConfig: () => ({
					relayState: '/testFromURI',
				}),
				completeLogin: () => {},
			}),
		).toBe(
			'/welcome/123?fromURI=%2FtestFromURI&appClientId=test123&maxAge=100',
		);
	});

	it('should return /signin with valid query params and third party return url and third party client id - identity classic', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams(),
				'https://profile.theguardian.com',
				'',
				{
					getRequestContext: () => ({
						target: {
							clientId: 'test123',
							label: 'jobs_site',
						},
						authentication: {
							request: {
								max_age: 100,
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/signin?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com&maxAge=100',
		);
	});

	it('should return /signin with valid query params and third party return url and third party client id - identity engine', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams(),
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
						authentication: {
							request: {
								max_age: 100,
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/signin?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com&maxAge=100',
		);
	});

	it('should return /signin with valid query params and third party return url and third party client id - identity engine', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams(),
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
					completeLogin: () => {},
				},
			),
		).toBe(
			'/signin?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com',
		);
	});

	it('should return /welcome/:token with valid query params and third party return url and third party client id - identity classic', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams('?activation_token=123'),
				'https://profile.theguardian.com',
				'',
				{
					getRequestContext: () => ({
						target: {
							clientId: 'test123',
							label: 'jobs_site',
						},
						authentication: {
							request: {
								max_age: 100,
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/welcome/123?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com&maxAge=100',
		);
	});

	it('should return /welcome/:token with valid query params and third party return url and third party client id - identity engine', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams('?activation_token=123'),
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
						authentication: {
							request: {
								max_age: 100,
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/welcome/123?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com&maxAge=100',
		);
	});

	it('should return /reset-password/:token with valid query params and third party return url and third party client id - identity classic', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams('?reset_password_token=123'),
				'https://profile.theguardian.com',
				'',
				{
					getRequestContext: () => ({
						target: {
							clientId: 'test123',
							label: 'jobs_site',
						},
						authentication: {
							request: {
								max_age: 100,
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/reset-password/123?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com&maxAge=100',
		);
	});

	it('should return /reset-password/:token with valid query params and third party return url and third party client id - identity engine', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams('?reset_password_token=123'),
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
						authentication: {
							request: {
								max_age: 100,
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/reset-password/123?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com&maxAge=100',
		);
	});

	it('should return /set-password/:token with valid query params and third party return url and third party client id - identity classic', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams('?set_password_token=123'),
				'https://profile.theguardian.com',
				'',
				{
					getRequestContext: () => ({
						target: {
							clientId: 'test123',
							label: 'jobs_site',
						},
						authentication: {
							request: {
								max_age: 100,
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/set-password/123?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com&maxAge=100',
		);
	});

	it('should return /set-password/:token with valid query params and third party return url and third party client id - identity engine', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams('?set_password_token=123'),
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
						authentication: {
							request: {
								max_age: 100,
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/set-password/123?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com&maxAge=100',
		);
	});

	it('should return /register when page=register with valid query params and third party return url and third party client id - identity classic', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams('?page=register'),
				'https://profile.theguardian.com',
				'',
				{
					getRequestContext: () => ({
						target: {
							clientId: 'test123',
							label: 'jobs_site',
						},
						authentication: {
							request: {
								max_age: 100,
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/register?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com&maxAge=100',
		);
	});

	it('should return /register when page=register with valid query params and third party return url and third party client id - identity engine', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams('?page=register'),
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
						authentication: {
							request: {
								max_age: 100,
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/register?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com&maxAge=100',
		);
	});

	it('should return /signin/google when page=google with valid query params and third party return url and third party client id - identity classic', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams('?page=google'),
				'https://profile.theguardian.com',
				'',
				{
					getRequestContext: () => ({
						target: {
							clientId: 'test123',
							label: 'jobs_site',
						},
						authentication: {
							request: {
								max_age: 100,
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/signin/google?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com&maxAge=100',
		);
	});

	it('should return /signin/google when page=google with valid query params and third party return url and third party client id - identity engine', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams('?page=google'),
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
						authentication: {
							request: {
								max_age: 100,
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/signin/google?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com&maxAge=100',
		);
	});

	it('should return /signin/apple when page=apple with valid query params and third party return url and third party client id - identity classic', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams('?page=apple'),
				'https://profile.theguardian.com',
				'',
				{
					getRequestContext: () => ({
						target: {
							clientId: 'test123',
							label: 'jobs_site',
						},
						authentication: {
							request: {
								max_age: 100,
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/signin/apple?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com&maxAge=100',
		);
	});

	it('should return /signin/apple when page=apple with valid query params and third party return url and third party client id - identity engine', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams('?page=apple'),
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
						authentication: {
							request: {
								max_age: 100,
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/signin/apple?fromURI=%2FtestFromURI&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com&maxAge=100',
		);
	});

	it('should get fromURI from location and queryparams if path starts with /oauth2/ and fromURI is not in the okta config - identity classic', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams('?client_id=test123&prompt=login'),
				'https://profile.theguardian.com',
				'/oauth2/v1/authorize',
				{
					getRequestContext: () => ({
						target: {
							clientId: 'test123',
							label: 'jobs_site',
						},
						authentication: {
							request: {
								max_age: 100,
							},
						},
					}),
					getSignInWidgetConfig: () => ({}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/signin?fromURI=%2Foauth2%2Fv1%2Fauthorize%3Fclient_id%3Dtest123%26prompt%3Dnone&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com&maxAge=100',
		);
	});

	it('should get fromURI from location and queryparams if path starts with /oauth2/ and fromURI is not in the okta config - identity engine', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams('?client_id=test123&prompt=login'),
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
						authentication: {
							request: {
								max_age: 100,
							},
						},
					}),
					getSignInWidgetConfig: () => ({}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/signin?fromURI=%2Foauth2%2Fv1%2Fauthorize%3Fclient_id%3Dtest123%26prompt%3Dnone&appClientId=test123&clientId=jobs&returnUrl=https%253A%252F%252Fjobs.theguardian.com&maxAge=100',
		);
	});

	it('should get clientId and maxAge from query params if not in requestContext', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams('?client_id=test123&prompt=login&max_age=100'),
				'https://profile.theguardian.com',
				'/oauth2/v1/authorize',
				{
					getRequestContext: () => ({}),
					getSignInWidgetConfig: () => ({}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/signin?fromURI=%2Foauth2%2Fv1%2Fauthorize%3Fclient_id%3Dtest123%26prompt%3Dnone%26max_age%3D100&appClientId=test123&maxAge=100',
		);
	});

	it('should add ref and refViewId to the redirect url if they are in the query params', () => {
		expect(
			getRedirectUrl(new URLSearchParams(`?ref=refUri&refViewId=123`), '', '', {
				getRequestContext: () => ({
					app: {
						value: {
							id: 'test123',
							label: 'testabc',
						},
					},
					authentication: {
						request: {
							max_age: 100,
						},
					},
				}),
				getSignInWidgetConfig: () => ({
					relayState: '/testFromURI',
				}),
				completeLogin: () => {},
			}),
		).toBe(
			'/signin?fromURI=%2FtestFromURI&appClientId=test123&maxAge=100&refViewId=123&ref=refUri',
		);
	});

	it('should not add ref or refViewId to the redirect url if refViewId is not in the query params', () => {
		expect(
			getRedirectUrl(new URLSearchParams(`?ref=refUri`), '', '', {
				getRequestContext: () => ({
					app: {
						value: {
							id: 'test123',
							label: 'testabc',
						},
					},
					authentication: {
						request: {
							max_age: 100,
						},
					},
				}),
				getSignInWidgetConfig: () => ({
					relayState: '/testFromURI',
				}),
				completeLogin: () => {},
			}),
		).toBe('/signin?fromURI=%2FtestFromURI&appClientId=test123&maxAge=100');
	});

	it('should use default ref which is locationOrigin + locationPathname if ref is not in the query params', () => {
		expect(
			getRedirectUrl(
				new URLSearchParams(`?refViewId=123`),
				'https://profile.thegulocal.com',
				'/test',
				{
					getRequestContext: () => ({
						app: {
							value: {
								id: 'test123',
								label: 'testabc',
							},
						},
						authentication: {
							request: {
								max_age: 100,
							},
						},
					}),
					getSignInWidgetConfig: () => ({
						relayState: '/testFromURI',
					}),
					completeLogin: () => {},
				},
			),
		).toBe(
			'/signin?fromURI=%2FtestFromURI&appClientId=test123&maxAge=100&refViewId=123&ref=https%3A%2F%2Fprofile.thegulocal.com%2Ftest',
		);
	});
});
