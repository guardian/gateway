import { expect } from '@playwright/test';
import { test } from '../../fixtures/mockedApiRequest';
import { injectAndCheckAxe } from '../../helpers/accessibility';

test.describe('Password set/create flow', () => {
	test.beforeEach(async ({ mockApi }) => {
		await mockApi.get('/mock/purge');
	});

	test.describe('A11y checks', () => {
		test('Has no detectable a11y violations on resend password page', async ({
			page,
			mockApi,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn/recovery/token',
					status: 500,
					body: {},
				},
			});
			await page.goto('/set-password/fake_token');
			await injectAndCheckAxe(page);
		});

		test('Has no detectable a11y violations on create/set password page', async ({
			mockApi,
			page,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn/recovery/token',
					status: 200,
					body: {},
				},
			});
			await page.goto('/set-password/fake_token');
			await injectAndCheckAxe(page);
		});

		test('Has no detectable a11y violations on create/set password page with error', async ({
			mockApi,
			page,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn/recovery/token',
					status: 200,
					body: {},
				},
			});
			await page.goto('/set-password/fake_token');
			await page.locator('input[name="password"]').fill('short');
			await page.locator('button[type="submit"]').click();
			await injectAndCheckAxe(page);
		});

		test('Has no detectable a11y violations on create/set password complete page', async ({
			mockApi,
			page,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn/recovery/token',
					status: 200,
					body: {},
				},
			});
			const breachCheckPromise = page.waitForRequest(
				'https://api.pwnedpasswords.com/range/*',
			);
			await page.goto('/set-password/fake_token');
			await page
				.locator('input[name="password"]')
				.fill('thisisalongandunbreachedpassword');
			await breachCheckPromise;
			await page.locator('button[type="submit"]').click();
			await injectAndCheckAxe(page);
		});
	});

	test.describe('show / hide password eye button', () => {
		test('clicking on the password eye shows the password and clicking it again hides it', async ({
			mockApi,
			page,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn/recovery/token',
					status: 200,
					body: {},
				},
			});
			await page.goto('/set-password/fake_token');
			await expect(page.locator('input[name="password"]')).toHaveAttribute(
				'type',
				'password',
			);
			await page.locator('input[name="password"]').fill('some_password');
			await page.locator('[data-cy=password-input-eye-button]').click();
			await expect(page.locator('input[name="password"]')).toHaveAttribute(
				'type',
				'text',
			);
			await page.locator('[data-cy=password-input-eye-button]').click();
			await expect(page.locator('input[name="password"]')).toHaveAttribute(
				'type',
				'password',
			);
		});
	});

	test.describe('An expired/invalid token is used', () => {
		test('shows a resend password page', async ({ mockApi, page }) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn/recovery/token',
					status: 500,
					body: {},
				},
			});
			await page.goto('/set-password/fake_token');
			await expect(page.getByText('This link has expired')).toBeVisible();
		});

		test('does not allow email resend if reCAPTCHA check fails', async ({
			mockApi,
			page,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn/recovery/token',
					status: 500,
					body: {},
				},
			});
			await page.route(/.*google\.com\/recaptcha\/.*/, async (route) => {
				await route.abort('failed');
			});
			await page.goto('/set-password/fake_token');
			await expect(page.getByText('This link has expired')).toBeVisible();
			await page.locator('input[name="email"]').fill('some@email.com');
			await page.locator('button[type="submit"]').click();
			await expect(
				page.getByText('Google reCAPTCHA verification failed.'),
			).toBeVisible();
			await expect(
				page.getByText('If the problem persists please try the following:'),
			).toBeVisible();
		});
	});

	test.describe('General IDAPI failure on token read', () => {
		test('displays the password resend page', async ({ mockApi, page }) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn/recovery/token',
					status: 500,
					body: {},
				},
			});
			await page.goto('/set-password/fake_token');
			await expect(page.getByText('This link has expired')).toBeVisible();
		});
	});

	test.describe('General IDAPI failure on password change', () => {
		test('displays a generic error message', async ({ mockApi, page }) => {
			await Promise.all([
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/authn/recovery/token',
						status: 200,
						body: {
							stateToken: 'someStateToken',
							expiresAt: new Date(
								Date.now() + 1800000,
							).toISOString() /* 30mins from now */,
							status: 'SUCCESS',
							_embedded: {
								user: {
									id: '12345',
									passwordChanged: new Date().toISOString(),
									profile: {
										login: 'test@example.com',
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
						status: 500,
						body: {},
					},
				}),
			]);
			const breachCheckPromise = page.waitForRequest(
				'https://api.pwnedpasswords.com/range/*',
			);
			await page.goto('/set-password/fake_token');
			await page
				.locator('input[name="password"]')
				.fill('thisisalongandunbreachedpassword');
			await breachCheckPromise;
			await page.locator('button[type="submit"]').click();
			await expect(
				page.getByText(
					'There was a problem changing your password, please try again.',
				),
			).toBeVisible();
		});
	});
});
