import { expect } from '@playwright/test';
import { test } from '../../fixtures/mockedApiRequest';
import { injectAndCheckAxe } from '../../helpers/accessibility';

test.describe('Password change flow', () => {
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
			await page.goto('/reset-password/fake_token');
			await injectAndCheckAxe(page);
		});

		test('Has no detectable a11y violations on change password page', async ({
			page,
			mockApi,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn/recovery/token',
					status: 200,
					body: {},
				},
			});
			await page.goto('/reset-password/fake_token');
			await injectAndCheckAxe(page);
		});

		test('Has no detectable a11y violations on change password page with error', async ({
			page,
			mockApi,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn/recovery/token',
					status: 200,
					body: {},
				},
			});
			await page.goto('/reset-password/fake_token');
			await page.locator('input[name="password"]').fill('short');
			await page.locator('button[type="submit"]').click();
			await injectAndCheckAxe(page);
		});

		test('Has no detectable a11y violations on change password complete page', async ({
			page,
			mockApi,
		}) => {
			await Promise.all([
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/authn/recovery/token',
						status: 200,
						body: {},
					},
				}),
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/authn/credentials/reset_password',
						status: 200,
						body: {},
					},
				}),
			]);
			await page.goto('/reset-password/fake_token');
			await injectAndCheckAxe(page);
		});
	});

	test.describe('show / hide password eye button', () => {
		test('clicking on the password eye shows the password and clicking it again hides it', async ({
			page,
			mockApi,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn/recovery/token',
					status: 200,
					body: {},
				},
			});
			await page.goto('/reset-password/fake_token');
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

	test.describe('Password exists in breach dataset', () => {
		test('displays a breached error', async ({ page, mockApi }) => {
			await Promise.all([
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/authn/recovery/token',
						status: 200,
						body: {},
					},
				}),
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/authn/credentials/reset_password',
						status: 200,
						body: {},
					},
				}),
			]);
			const breachCheckPromise = page.waitForRequest(
				'https://api.pwnedpasswords.com/range/*',
			);
			await page.goto('/reset-password/fake_token');
			await page.locator('input[name="password"]').fill('password');
			await breachCheckPromise;
			await expect(
				page.getByText('avoid passwords that are easy to guess'),
			).toBeVisible();
			await expect(page.locator('button[type="submit"]')).not.toBeDisabled();
		});
	});

	test.describe('CSRF token error on submission', () => {
		test('should fail on submission due to CSRF token failure if CSRF token cookie is not sent', async ({
			page,
			context,
			mockApi,
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
			await page.goto('/reset-password/fake_token');
			// Clear the CSRF cookie
			const cookies = await context.cookies();
			const csrfCookie = cookies.find((c) => c.name === '__Host-_csrf');
			if (csrfCookie) {
				await context.clearCookies({ name: '__Host-_csrf' });
			}
			await page
				.locator('input[name="password"]')
				.fill('thisisalongandunbreachedpassword');
			await breachCheckPromise;
			await page.locator('button[type="submit"]').click();
			await expect(page.getByText('Please try again.')).toBeVisible();
		});
	});

	test.describe('Password field is left blank', () => {
		test('uses the standard HTML5 empty field validation', async ({
			page,
			mockApi,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn/recovery/token',
					status: 200,
					body: {},
				},
			});
			await page.goto('/reset-password/fake_token');
			await page.locator('button[type="submit"]').click();
			const passwordInput = page.locator('input[name="password"]:invalid');
			await expect(passwordInput).toHaveCount(1);
		});
	});

	test.describe('password too short', () => {
		test('shows an error showing the password length must be within certain limits', async ({
			page,
			mockApi,
		}) => {
			await Promise.all([
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/authn/recovery/token',
						status: 200,
						body: {},
					},
				}),
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/authn/credentials/reset_password',
						status: 200,
						body: {},
					},
				}),
			]);
			await page.goto('/reset-password/fake_token');
			await page.locator('input[name="password"]').fill('p');
			await page.locator('button[type="submit"]').focus();
			// Error is shown before clicking submit
			await expect(page.getByText('At least 8')).toBeVisible();
			await page.locator('button[type="submit"]').click();
			// Error still exists after clicking submit
			await expect(
				page.getByText(
					'Please make sure your password is at least 8 characters long.',
				),
			).toBeVisible();
			const breachCheckPromise = page.waitForRequest(
				'https://api.pwnedpasswords.com/range/*',
			);
			await page
				.locator('input[name="password"]')
				.fill('piamaveryuniqueandlongstring');
			await breachCheckPromise;
			await expect(page.getByText('Strong password required')).toBeVisible();
		});
	});

	test.describe('password too long', () => {
		test('shows an error showing the password length must be within certain limits', async ({
			page,
			mockApi,
		}) => {
			const excessivelyLongPassword = Array.from(Array(73), () => 'a').join('');
			await Promise.all([
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/authn/recovery/token',
						status: 200,
						body: {},
					},
				}),
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/authn/credentials/reset_password',
						status: 200,
						body: {},
					},
				}),
			]);
			const pwdBreachCheck = page.waitForRequest(
				'https://api.pwnedpasswords.com/range/*',
			);
			await page.goto('/reset-password/fake_token');
			await page
				.locator('input[name="password"]')
				.pressSequentially(excessivelyLongPassword);
			await page.locator('button[type="submit"]').focus();
			// Error is shown before clicking submit
			await expect(page.getByText('Maximum of 72')).toBeVisible();
			await pwdBreachCheck;
			await page.locator('button[type="submit"]').click();
			// Error still exists after clicking submit
			await expect(
				page.getByText(
					'Please make sure your password is not longer than 72 characters.',
				),
			).toBeVisible();
			await page.locator('input[name="password"]').clear();
			await page
				.locator('input[name="password"]')
				.fill('iamaveryuniqueandlongstring');
			await pwdBreachCheck;
			await expect(page.getByText('Strong password required')).toBeVisible();
		});
	});

	test.describe('General IDAPI failure on token read', () => {
		test('displays the password resend page', async ({ page, mockApi }) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn/recovery/token',
					status: 500,
					body: {},
				},
			});
			await page.goto('/reset-password/fake_token');
			await expect(page.getByText('Link expired')).toBeVisible();
		});
	});

	test.describe('General IDAPI failure on password change', () => {
		test('displays a generic error message', async ({ page, mockApi }) => {
			await Promise.all([
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/authn/recovery/token',
						status: 200,
						body: {},
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
			await page.goto('/reset-password/fake_token');
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
