import { expect } from '@playwright/test';
import { test } from '../../fixtures/mockedApiRequest';
import { injectAndCheckAxe } from '../../helpers/accessibility';

const CONTENT = {
	ERRORS: {
		GENERIC: 'Sorry, something went wrong. Please try again.',
		NO_ACCOUNT:
			'There is no account for that email address, please check for typos or create an account',
		NO_EMAIL: 'Email field must not be blank.',
	},
};
const validEmail = 'test@example.com';
const emailNotRegistered = 'notregistered@example.com';

test.describe('Password reset flow', () => {
	test.beforeEach(async ({ mockApi, page }) => {
		await mockApi.get('/mock/purge');
		await page.goto('/reset-password');
	});

	test.describe('A11y checks', () => {
		test('Has no detectable a11y violations on reset password page', async ({
			page,
		}) => {
			await injectAndCheckAxe(page);
		});

		test('Has no detectable a11y violations on reset password page with error', async ({
			mockApi,
			page,
		}) => {
			await mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/api/v1/users/.*',
					status: 500,
					body: {},
				},
			});
			await page.locator('input[name="email"]').fill('example@example.com');
			await page.getByText('Request password reset').click();
			await injectAndCheckAxe(page);
		});

		test('Has no detectable a11y violations on email sent page', async ({
			mockApi,
			page,
		}) => {
			await mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/api/v1/users/.*',
					status: 200,
					body: {},
				},
			});
			await page.locator('input[name="email"]').fill(validEmail);
			await page.getByText('Request password reset').click();
			await injectAndCheckAxe(page);
		});
	});

	test.describe('Email field is left blank', () => {
		test('displays the standard HTML validation', async ({ page }) => {
			await page.getByText('Request password reset').click();
			const invalidEmailField = page.locator('input[name="email"]:invalid');
			await expect(invalidEmailField).toHaveCount(1);
		});
	});

	test.describe('Email is invalid', () => {
		test('displays the standard HTML validation', async ({ page }) => {
			await page.locator('input[name="email"]').fill('bademail£');
			await page.getByText('Request password reset').click();
			const invalidEmailField = page.locator('input[name="email"]:invalid');
			await expect(invalidEmailField).toHaveCount(1);
		});
	});

	test.describe('General IDAPI failure', () => {
		test('displays a generic error message', async ({ mockApi, page }) => {
			await mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/api/v1/users/.*',
					status: 500,
					body: {},
				},
			});
			await page.locator('input[name="email"]').fill(validEmail);
			await page.getByText('Request password reset').click();
			await expect(page.getByText(CONTENT.ERRORS.GENERIC)).toBeVisible();
		});
	});

	test.describe('Recaptcha errors', () => {
		test('shows recaptcha error message when reCAPTCHA token request fails', async ({
			page,
		}) => {
			await page.route(/.*google\.com\/recaptcha\/.*/, async (route) => {
				await route.abort('failed');
			});
			/*
			 * navigate again to /reset-password as the beforeEach block at the top of
			 * this file would navigate and happen before the recaptcha network request intercept
			 */
			await page.goto('/reset-password');

			await page.locator('input[name="email"]').fill(emailNotRegistered);
			await page.getByText('Request password reset').click();
			await expect(
				page.getByText('Google reCAPTCHA verification failed.'),
			).toBeVisible();
			await expect(
				page.getByText('If the problem persists please try the following:'),
			).toBeVisible();
		});
	});
});
