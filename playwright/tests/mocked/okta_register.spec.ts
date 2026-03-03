import { BrowserContext, expect } from '@playwright/test';
import { test } from '../../fixtures/mockedApiRequest';
import { mockRequestPattern } from '../../helpers/network/mocking';

test.describe('Okta Register flow', () => {
	test.beforeEach(async ({ mockApi, page, context }) => {
		await mockApi.get('/mock/purge');
		await context.clearCookies();
		// we visit the healthcheck page to make sure the cookies are cleared from the browser
		await page.goto('/healthcheck');
	});

	const setIdxCookie = async (context: BrowserContext) => {
		await context.addCookies([
			{
				name: 'idx',
				value: 'the_idx_cookie',
				domain: 'profile.thegulocal.com',
				path: '/',
			},
		]);
	};

	const sessionsMe200Response = {
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
	};

	test.describe('Signed in user posts to /register', () => {
		test.beforeEach(async ({ mockApi, page, context }) => {
			await mockApi.get('/mock/purge');
			await context.clearCookies();
			// we visit the healthcheck page to make sure the cookies are cleared from the browser
			await page.goto('/healthcheck');
		});
		test('should redirect to homepage if the idx Okta session cookie is valid', async ({
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
				data: sessionsMe200Response,
			});
			await mockApi.post('/mock', {
				headers: {
					'Content-Type': 'application/json',
					'x-status': '204',
					'x-path': '/api/v1/users/userId/sessions',
				},
				data: {},
			});

			await page.goto('/register/email');

			await setIdxCookie(context);

			await page.locator('input[name="email"]').fill('example@example.com');
			await mockApi.post('/mock', {
				headers: { 'Content-Type': 'application/json', 'x-status': '200' },
				data: {
					userType: 'new',
				},
			});
			await mockApi.post('/mock', {
				headers: { 'Content-Type': 'application/json', 'x-status': '200' },
				data: {
					status: 'success',
					errors: [],
				},
			});
			await page.locator('[data-cy=main-form-submit-button]').click();

			await expect(page.getByText('Sign in to the Guardian')).toBeVisible();
			await expect(page.getByText('You are signed in with')).toBeVisible();
			await expect(page.getByText('user@example.com')).toBeVisible();
			const continueLink = page.locator('a', { hasText: 'Continue' });

			await expect(continueLink).toHaveAttribute(
				'href',
				/^(?=.*\/signin\/refresh)(?=.*returnUrl=https%3A%2F%2Fm.code.dev-theguardian.com)/,
			);

			const signInLink = page.locator('a', { hasText: 'Sign in' });
			await expect(signInLink).toHaveAttribute(
				'href',
				/\/signout\?returnUrl=https%253A%252F%252Fprofile.thegulocal.com%252Fsignin/,
			);
			await expect(
				page.getByText('Sign in with a different email'),
			).toBeVisible();
		});

		test('should redirect to /reauthenticate if the idx Okta session cookie is set, but invalid', async ({
			mockApi,
			page,
			context,
		}) => {
			await mockApi.post('/mock', {
				headers: {
					'Content-Type': 'application/json',
					'x-status': '404',
					'x-path': '/api/v1/sessions/me',
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

			await setIdxCookie(context);

			// visit healthcheck to set the cookie
			await page.goto('/healthcheck');

			await page.goto('/register');

			await expect(page).toHaveURL(/\/reauthenticate/);

			const cookies = await context.cookies();
			const idxCookie = cookies.find((c) => c.name === 'idx');
			expect(idxCookie).toBeUndefined();
		});
	});

	test.describe('Signed in user visits /register', () => {
		test.beforeEach(async ({ mockApi, page, context }) => {
			await mockApi.get('/mock/purge');
			await context.clearCookies();
			// we visit the healthcheck page to make sure the cookies are cleared from the browser
			await page.goto('/healthcheck');
		});
		test('should redirect to homepage if the idx Okta session cookie is valid', async ({
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
				data: sessionsMe200Response,
			});

			await mockApi.post('/mock', {
				headers: {
					'Content-Type': 'application/json',
					'x-status': '204',
					'x-path': '/api/v1/users/userId/sessions',
				},
				data: {},
			});

			await setIdxCookie(context);

			await page.goto('/healthcheck');

			await page.goto('/register');

			await expect(page.getByText('Sign in to the Guardian')).toBeVisible();
			await expect(page.getByText('You are signed in with')).toBeVisible();
			await expect(page.getByText('user@example.com')).toBeVisible();

			const continueLink = page.locator('a', { hasText: 'Continue' });

			await expect(continueLink).toHaveAttribute(
				'href',
				/^(?=.*\/signin\/refresh)(?=.*returnUrl=https%3A%2F%2Fm.code.dev-theguardian.com)/,
			);

			const signInLink = page.locator('a', { hasText: 'Sign in' });
			await expect(signInLink).toHaveAttribute(
				'href',
				/\/signout\?returnUrl=https%253A%252F%252Fprofile.thegulocal.com%252Fsignin/,
			);
			await expect(
				page.getByText('Sign in with a different email'),
			).toBeVisible();
		});

		test('should redirect to /reauthenticate if the idx Okta session cookie is set but invalid', async ({
			page,
			context,
		}) => {
			await mockRequestPattern(page, '/api/v1/sessions/me', {
				status: 404,
			});

			await mockRequestPattern(page, '/api/v1/users/userId/sessions', {
				status: 204,
				body: {},
			});

			await setIdxCookie(context);

			// visit healthcheck to set the cookie
			await page.goto('/healthcheck');

			await page.goto('/register');

			await expect(page).toHaveURL(/\/reauthenticate/);

			const cookies = await context.cookies();
			const idxCookie = cookies.find((c) => c.name === 'idx');
			expect(idxCookie).toBeUndefined();
		});
	});
});
