import { expect } from '@playwright/test';
import { test } from '../../fixtures/mockedApiRequest';

test.describe('POST requests return a user-facing error message when encountering a rate limit from Okta', () => {
	const v1Users429Response = {
		errorCode: 'E0000047',
		errorSummary: 'API call exceeded rate limit due to too many requests.',
		errorLink: 'E0000047',
		errorId: 'sampleXAy5B35EOzELmZL1zMy',
		errorCauses: [],
	};
	test.beforeEach(async ({ mockApi }) => {
		await mockApi.get('/mock/purge');
	});
	test('Submit /signin', async ({ mockApi, page }) => {
		await mockApi.post('/mock/permanent-pattern', {
			data: {
				path: '/api/v1/users/.*',
				status: 429,
				body: v1Users429Response,
			},
		});
		await page.goto('/signin?usePasswordSignIn=true');
		await page.locator('input[name="email"]').fill('example@example.com');
		await page.locator('input[name="password"]').fill('password');

		await page.locator('button[type=submit]').click();
		await expect(
			page.getByText('There was a problem signing in, please try again.'),
		).toBeVisible();
	});

	test('Submit /reauthenticate', async ({ mockApi, page }) => {
		await page.goto('/reauthenticate?usePasswordSignIn=true');
		await page.locator('input[name="email"]').fill('example@example.com');
		await page.locator('input[name="password"]').fill('password');

		await mockApi.post('/mock/permanent-pattern', {
			data: {
				path: '/api/v1/users/.*',
				status: 429,
				body: v1Users429Response,
			},
		});
		await page.locator('button[type=submit]').click();
		await expect(
			page.getByText('There was a problem signing in, please try again.'),
		).toBeVisible();
	});

	test('Submit /register', async ({ mockApi, page }) => {
		await page.goto('/register/email');
		await page.locator('input[name="email"]').fill('example@example.com');

		await mockApi.post('/mock/permanent-pattern', {
			data: {
				path: '/api/v1/users/.*',
				status: 429,
				body: v1Users429Response,
			},
		});
		await page.locator('button[type=submit]').click();
		await expect(
			page.getByText('There was a problem registering, please try again.'),
		).toBeVisible();
	});

	test('Submit /reset-password', async ({ mockApi, page }) => {
		await page.goto('/reset-password');
		await page.locator('input[name="email"]').fill('example@example.com');

		await mockApi.post('/mock/permanent-pattern', {
			data: {
				path: '/api/v1/users/.*',
				status: 429,
				body: v1Users429Response,
			},
		});
		await page.locator('button[type=submit]').click();
		await expect(
			page.getByText('Sorry, something went wrong. Please try again.'),
		).toBeVisible();
	});

	test('Submit /welcome/resend', async ({ mockApi, page }) => {
		await page.goto(`/welcome/resend`);
		await page.locator('input[name="email"]').fill('example@example.com');

		await mockApi.post('/mock/permanent-pattern', {
			data: {
				path: '/api/v1/users/.*',
				status: 429,
				body: v1Users429Response,
			},
		});
		await page.locator('button[type=submit]').click();
		await expect(
			page.getByText('There was a problem registering, please try again.'),
		).toBeVisible();
	});

	test('Submit /welcome/expired', async ({ mockApi, page }) => {
		await page.goto(`/welcome/expired`);
		await page.locator('input[name="email"]').fill('example@example.com');

		await mockApi.post('/mock/permanent-pattern', {
			data: {
				path: '/api/v1/users/.*',
				status: 429,
				body: v1Users429Response,
			},
		});
		await page.locator('button[type=submit]').click();
		await expect(
			page.getByText('There was a problem registering, please try again.'),
		).toBeVisible();
	});

	test('Submit /reset-password/resend', async ({ mockApi, page }) => {
		await page.goto(`/reset-password/resend`);
		await page.locator('input[name="email"]').fill('example@example.com');

		await mockApi.post('/mock/permanent-pattern', {
			data: {
				path: '/api/v1/users/.*',
				status: 429,
				body: v1Users429Response,
			},
		});
		await page.locator('button[type=submit]').click();
		await expect(
			page.getByText('Sorry, something went wrong. Please try again.'),
		).toBeVisible();
	});

	test('Submit /reset-password/expired', async ({ mockApi, page }) => {
		await page.goto(`/reset-password/expired`);
		await page.locator('input[name="email"]').fill('example@example.com');

		await mockApi.post('/mock/permanent-pattern', {
			data: {
				path: '/api/v1/users/.*',
				status: 429,
				body: v1Users429Response,
			},
		});
		await page.locator('button[type=submit]').click();
		await expect(
			page.getByText('Sorry, something went wrong. Please try again.'),
		).toBeVisible();
	});

	test('Submit /set-password/resend', async ({ mockApi, page }) => {
		await page.goto(`/set-password/resend`);
		await page.locator('input[name="email"]').fill('example@example.com');

		await mockApi.post('/mock/permanent-pattern', {
			data: {
				path: '/api/v1/users/.*',
				status: 429,
				body: v1Users429Response,
			},
		});
		await page.locator('button[type=submit]').click();
		await expect(
			page.getByText('Sorry, something went wrong. Please try again.'),
		).toBeVisible();
	});

	test('Submit /set-password/expired', async ({ mockApi, page }) => {
		await page.goto(`/set-password/expired`);
		await page.locator('input[name="email"]').fill('example@example.com');

		await mockApi.post('/mock/permanent-pattern', {
			data: {
				path: '/api/v1/users/.*',
				status: 429,
				body: v1Users429Response,
			},
		});
		await page.locator('button[type=submit]').click();
		await expect(
			page.getByText('Sorry, something went wrong. Please try again.'),
		).toBeVisible();
	});
});
