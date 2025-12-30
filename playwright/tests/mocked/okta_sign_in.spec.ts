import { expect } from '@playwright/test';
import { test } from '../../fixtures/mockedApiRequest';

test.describe('Sign in flow', () => {
	test.describe('Signing in - Okta', () => {
		test.beforeEach(async ({ mockApi }) => {
			await mockApi.get('/mock/purge');
		});

		test('loads the "signed in as" page if user is already authenticated', async ({
			mockApi,
			page,
			context,
		}) => {
			await mockApi.post('/mock', {
				headers: {
					'Content-Type': 'application/json',
					'x-status': '200',
					'x-path': '/api/v1/sessions/me',
				},
				data: {
					id: 'test',
					login: 'user@example.com',
					userId: 'userId',
					status: 'ACTIVE',
					expiresAt: '2016-01-03T09:13:17.000Z',
					lastPasswordVerification: '2016-01-03T07:02:00.000Z',
					lastFactorVerification: null,
					amr: ['pwd'],
					idp: {
						id: '01a2bcdef3GHIJKLMNOP',
						type: 'OKTA',
					},
				},
			});

			await mockApi.post('/mock', {
				headers: {
					'Content-Type': 'application/json',
					'x-status': '204',
					'x-path': '/api/v1/users/userId/sessions',
				},
				data: {},
			});

			await context.addCookies([
				{
					name: 'idx',
					value: 'the_idx_cookie',
					domain: 'profile.thegulocal.com',
					path: '/',
				},
			]);

			await page.goto('/signin');

			await expect(page.getByText('Sign in to the Guardian')).toBeVisible();
			await expect(page.getByText('You are signed in with')).toBeVisible();
			await expect(page.getByText('user@example.com')).toBeVisible();
			const continueLink = page.getByText('Continue');
			await expect(continueLink).toHaveAttribute('href', /\/signin\/refresh/);
			await expect(continueLink).toHaveAttribute(
				'href',
				/returnUrl=https%3A%2F%2Fm.code.dev-theguardian.com/,
			);
			const signInLink = page.locator('a', { hasText: 'Sign in' });
			await expect(signInLink).toHaveAttribute(
				'href',
				/\/signout\?returnUrl=https%253A%252F%252Fprofile.thegulocal.com%252Fsignin%253FreturnUrl%253Dhttps%25253A%25252F%25252Fm.code.dev-theguardian.com/,
			);
			await expect(
				page.getByText('Sign in with a different email'),
			).toBeVisible();
		});

		test('loads the "signed in as" page if user is already authenticated and coming from native app and oauth flow - live app', async ({
			mockApi,
			page,
			context,
		}) => {
			await context.addCookies([
				{
					name: 'idx',
					value: 'the_idx_cookie',
					domain: 'profile.thegulocal.com',
					path: '/',
					secure: true,
				},
			]);

			await Promise.all([
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/sessions/me',
						status: 200,
						body: {
							id: 'test',
							login: 'user@example.com',
							userId: 'userId',
							status: 'ACTIVE',
							expiresAt: '2016-01-03T09:13:17.000Z',
							lastPasswordVerification: '2016-01-03T07:02:00.000Z',
							lastFactorVerification: null,
							amr: ['pwd'],
							idp: {
								id: '01a2bcdef3GHIJKLMNOP',
								type: 'OKTA',
							},
						},
					},
				}),
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/users/userId/sessions',
						status: 204,
						body: {},
					},
				}),
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/apps/123',
						status: 200,
						body: {
							id: '123',
							label: 'ios_live_app',
							settings: {
								oauthClient: {
									redirect_uris: [],
								},
							},
						},
					},
				}),
			]);
			await page.goto(
				'/signin?appClientId=123&fromURI=/oauth2/v1/authorize/redirect?okta_key=oktaKey',
				{ waitUntil: 'domcontentloaded' },
			);

			await expect(page.getByText('Sign in to the Guardian app')).toBeVisible();
			await expect(page.getByText('You are signed in with')).toBeVisible();
			await expect(page.getByText('user@example.com')).toBeVisible();
			const continueLink = page.getByText('Continue');
			await expect(continueLink).toHaveAttribute(
				'href',
				/\/oauth2\/v1\/authorize\/redirect\?okta_key=oktaKey/,
			);
			const signInLink = page.locator('a', { hasText: 'Sign in' });
			await expect(signInLink).toHaveAttribute(
				'href',
				/\/signout\?returnUrl=https%253A%252F%252Fprofile.thegulocal.com%252Fsignin%253FappClientId%253D123%2526fromURI%253D%25252Foauth2%25252Fv1%25252Fauthorize%25252Fredirect%25253Fokta_key%25253DoktaKey%2526returnUrl%253Dhttps%25253A%25252F%25252Fm.code.dev-theguardian.com/,
			);
			await expect(
				page.getByText('Sign in with a different email'),
			).toBeVisible();
		});

		test('loads the "signed in as" page if user is already authenticated and coming from native app and oauth flow - feast app ios', async ({
			mockApi,
			page,
			context,
		}) => {
			await Promise.all([
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/sessions/me',
						status: 200,
						body: {
							id: 'test',
							login: 'user@example.com',
							userId: 'userId',
							status: 'ACTIVE',
							expiresAt: '2016-01-03T09:13:17.000Z',
							lastPasswordVerification: '2016-01-03T07:02:00.000Z',
							lastFactorVerification: null,
							amr: ['pwd'],
							idp: {
								id: '01a2bcdef3GHIJKLMNOP',
								type: 'OKTA',
							},
						},
					},
				}),
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/users/userId/sessions',
						status: 204,
						body: {},
					},
				}),
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/apps/456',
						status: 200,
						body: {
							id: '456',
							label: 'ios_feast_app',
							settings: {
								oauthClient: {
									redirect_uris: [],
								},
							},
						},
					},
				}),
			]);

			await context.addCookies([
				{
					name: 'idx',
					value: 'the_idx_cookie',
					domain: 'profile.thegulocal.com',
					path: '/',
				},
			]);

			await page.goto(
				'/signin?appClientId=456&fromURI=/oauth2/v1/authorize/redirect?okta_key=oktaKey',
			);

			await expect(page.getByText('Sign in to the Feast app')).toBeVisible();
			await expect(page.getByText('You are signed in with')).toBeVisible();
			await expect(page.getByText('user@example.com')).toBeVisible();
			const continueLink = page.getByText('Continue');
			await expect(continueLink).toHaveAttribute(
				'href',
				/\/oauth2\/v1\/authorize\/redirect\?okta_key=oktaKey/,
			);
			const signInLink = page.locator('a', { hasText: 'Sign in' });
			await expect(signInLink).toHaveAttribute(
				'href',
				/\/signout\?returnUrl=https%253A%252F%252Fprofile.thegulocal.com%252Fsignin%253FappClientId%253D456%2526fromURI%253D%25252Foauth2%25252Fv1%25252Fauthorize%25252Fredirect%25253Fokta_key%25253DoktaKey%2526returnUrl%253Dhttps%25253A%25252F%25252Fm.code.dev-theguardian.com/,
			);
			await expect(
				page.getByText('Sign in with a different email'),
			).toBeVisible();
		});

		test('loads the "signed in as" page if user is already authenticated and coming from native app and oauth flow - feast app android', async ({
			mockApi,
			page,
			context,
		}) => {
			await Promise.all([
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/sessions/me',
						status: 200,
						body: {
							id: 'test',
							login: 'user@example.com',
							userId: 'userId',
							status: 'ACTIVE',
							expiresAt: '2016-01-03T09:13:17.000Z',
							lastPasswordVerification: '2016-01-03T07:02:00.000Z',
							lastFactorVerification: null,
							amr: ['pwd'],
							idp: {
								id: '01a2bcdef3GHIJKLMNOP',
								type: 'OKTA',
							},
						},
					},
				}),
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/users/userId/sessions',
						status: 204,
						body: {},
					},
				}),
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/apps/456',
						status: 200,
						body: {
							id: '456',
							label: 'android_feast_app',
							settings: {
								oauthClient: {
									redirect_uris: [],
								},
							},
						},
					},
				}),
			]);

			await context.addCookies([
				{
					name: 'idx',
					value: 'the_idx_cookie',
					domain: 'profile.thegulocal.com',
					path: '/',
				},
			]);

			await page.goto(
				'/signin?appClientId=456&fromURI=/oauth2/v1/authorize/redirect?okta_key=oktaKey',
			);

			await expect(page.getByText('Sign in to the Feast app')).toBeVisible();
			await expect(page.getByText('You are signed in with')).toBeVisible();
			await expect(page.getByText('user@example.com')).toBeVisible();
			const continueLink = page.getByText('Continue');
			await expect(continueLink).toHaveAttribute(
				'href',
				/\/oauth2\/v1\/authorize\/redirect\?okta_key=oktaKey/,
			);
			const signInLink = page.locator('a', { hasText: 'Sign in' });
			await expect(signInLink).toHaveAttribute(
				'href',
				/\/signout\?returnUrl=https%253A%252F%252Fprofile.thegulocal.com%252Fsignin%253FappClientId%253D456%2526fromURI%253D%25252Foauth2%25252Fv1%25252Fauthorize%25252Fredirect%25253Fokta_key%25253DoktaKey%2526returnUrl%253Dhttps%25253A%25252F%25252Fm.code.dev-theguardian.com/,
			);
			await expect(
				page.getByText('Sign in with a different email'),
			).toBeVisible();
		});

		test('loads the "signed in as" page if user is already authenticated and coming from jobs and oauth flow', async ({
			mockApi,
			page,
			context,
		}) => {
			await Promise.all([
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/sessions/me',
						status: 200,
						body: {
							id: 'test',
							login: 'user@example.com',
							userId: 'userId',
							status: 'ACTIVE',
							expiresAt: '2016-01-03T09:13:17.000Z',
							lastPasswordVerification: '2016-01-03T07:02:00.000Z',
							lastFactorVerification: null,
							amr: ['pwd'],
							idp: {
								id: '01a2bcdef3GHIJKLMNOP',
								type: 'OKTA',
							},
						},
					},
				}),
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/users/userId/sessions',
						status: 204,
						body: {},
					},
				}),
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/apps/456',
						status: 204,
						body: {
							id: 'jobs',
							label: 'jobs',
							settings: {
								oauthClient: {
									redirect_uris: [],
								},
							},
						},
					},
				}),
			]);

			await context.addCookies([
				{
					name: 'idx',
					value: 'the_idx_cookie',
					domain: 'profile.thegulocal.com',
					path: '/',
				},
			]);

			await page.goto(
				'/signin?clientId=jobs&fromURI=/oauth2/v1/authorize/redirect?okta_key=oktaKey',
			);

			await expect(page.getByText('Sign in with the Guardian')).toBeVisible();
			await expect(page.getByText('You are signed in with')).toBeVisible();
			await expect(page.getByText('user@example.com')).toBeVisible();
			await expect(
				page.getByText('If this is your first time using Guardian Jobs'),
			).toBeVisible();

			const continueLink = page.getByText('Continue');
			await expect(continueLink).toHaveAttribute(
				'href',
				/fromURI=%2Foauth2%2Fv1%2Fauthorize%2Fredirect%3Fokta_key%3DoktaKey/,
			);
			await expect(continueLink).toHaveAttribute('href', /\/agree\/GRS/);

			const signInLink = page.locator('a', { hasText: 'Sign in' });
			await expect(signInLink).toHaveAttribute(
				'href',
				/\/signout\?returnUrl=https%253A%252F%252Fprofile.thegulocal.com%252Fsignin%253FclientId%253Djobs%2526fromURI%253D%25252Foauth2%25252Fv1%25252Fauthorize%25252Fredirect%25253Fokta_key%25253DoktaKey%2526returnUrl%253Dhttps%25253A%25252F%25252Fm.code.dev-theguardian.com/,
			);
			await expect(
				page.getByText('Sign in with a different email'),
			).toBeVisible();
		});

		test('shows an error message when okta authentication fails - useOktaClassic', async ({
			mockApi,
			page,
		}) => {
			await page.goto('/signin?useOktaClassic=true');
			await page.locator('input[name="email"]').fill('example@example.com');
			await page.locator('input[name="password"]').fill('password');

			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn',
					status: 401,
					body: {
						errorCode: 'E0000004',
						errorSummary: 'errorSummary',
						errorLink: '',
						errorId: 'errorId',
						errorCauses: [],
					},
				},
			});
			await page.locator('[data-cy=main-form-submit-button]').click();
			await expect(
				page.getByText('Email and password don’t match'),
			).toBeVisible();
		});

		test('shows a generic error message when okta rate limited - useOktaClassic', async ({
			mockApi,
			page,
		}) => {
			await page.goto('/signin?useOktaClassic=true');
			await page.locator('input[name="email"]').fill('example@example.com');
			await page.locator('input[name="password"]').fill('password');
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn',
					status: 429,
					body: {
						errorCode: 'E0000047',
						errorSummary: 'errorSummary',
						errorLink: '',
						errorId: 'errorId',
						errorCauses: [],
					},
				},
			});
			await page.locator('[data-cy=main-form-submit-button]').click();
			await expect(
				page.getByText('There was a problem signing in, please try again.'),
			).toBeVisible();
		});

		test('shows a generic error message when okta api response unknown - useOktaClassic', async ({
			mockApi,
			page,
		}) => {
			await page.goto('/signin?useOktaClassic=true');
			await page.locator('input[name="email"]').fill('example@example.com');
			await page.locator('input[name="password"]').fill('password');
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn',
					status: 403,
					body: {
						errorCode: 'E0000147',
						errorSummary: 'errorSummary',
						errorLink: '',
						errorId: 'errorId',
						errorCauses: [],
					},
				},
			});
			await page.locator('[data-cy=main-form-submit-button]').click();
			await expect(
				page.getByText('There was a problem signing in, please try again.'),
			).toBeVisible();
		});

		test('loads the redirectUrl upon successful authentication for validated user - useOktaClassic', async ({
			mockApi,
			page,
		}) => {
			await page.goto(
				'/signin?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout&useOktaClassic=true',
			);
			await page.locator('input[name="email"]').fill('example@example.com');
			await page.locator('input[name="password"]').fill('password');

			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn',
					status: 200,
					body: {
						expiresAt: '3000-01-01T00:00:00.000Z',
						status: 'SUCCESS',
						sessionToken: 'some-session-token',
						_embedded: {
							user: {
								id: 'okta-id',
								passwordChanged: '2020-01-01T00:00:00.000Z',
								profile: {
									login: 'test.man@example.com',
									firstName: 'Test',
									lastName: 'Man',
									locale: 'en_GB',
									timeZone: 'Europe/London',
								},
							},
						},
					},
				},
			});

			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/users/okta-id/groups',
					status: 200,
					body: [
						{
							id: '123',
							profile: {
								name: 'GuardianUser-EmailValidated',
								description: 'User has validated their email',
							},
						},
					],
				},
			});

			// we can't actually check the authorization code flow
			// so intercept the request and redirect to the guardian about page
			await mockApi.post('/mock', {
				headers: {
					'Content-Type': 'application/json',
					'x-status': '302',
					'x-path': '/oauth2/default/v1/authorize*',
					'x-header-location': 'https://www.theguardian.com/about',
				},
				data: {},
			});

			await page.locator('[data-cy=main-form-submit-button]').click();
			await expect(page).toHaveURL('https://www.theguardian.com/about');
		});

		test('redirects to the default url if no redirectUrl given - useOktaClassic', async ({
			mockApi,
			page,
		}) => {
			await page.goto('/signin?useOktaClassic=true');
			await page.locator('input[name="email"]').fill('example@example.com');
			await page.locator('input[name="password"]').fill('password');

			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn',
					status: 200,
					body: {
						expiresAt: '3000-01-01T00:00:00.000Z',
						status: 'SUCCESS',
						sessionToken: 'some-session-token',
						_embedded: {
							user: {
								id: 'okta-id',
								passwordChanged: '2020-01-01T00:00:00.000Z',
								profile: {
									login: 'test.man@example.com',
									firstName: 'Test',
									lastName: 'Man',
									locale: 'en_GB',
									timeZone: 'Europe/London',
								},
							},
						},
					},
				},
			});
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/users/okta-id/groups',
					status: 200,
					body: [
						{
							id: '123',
							profile: {
								name: 'GuardianUser-EmailValidated',
								description: 'User has validated their email',
							},
						},
					],
				},
			});

			// we can't actually check the authorization code flow
			// so intercept the request and redirect to the default return URL
			await mockApi.post('/mock', {
				headers: {
					'Content-Type': 'application/json',
					'x-status': '302',
					'x-path': '/oauth2/default/v1/authorize*',
					'x-header-location': 'https://m.code.dev-theguardian.com/',
				},
				data: {},
			});

			await page.locator('[data-cy=main-form-submit-button]').click();
			await expect(page).toHaveURL(/^https:\/\/m\.code\.dev-theguardian.com/);
		});
	});
});
