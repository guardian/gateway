import { expect } from '@playwright/test';
import { test } from '../../fixtures/mockedApiRequest';
import { injectAndCheckAxe } from '../../helpers/accessibility';

test.describe('Registration flow', () => {
	test.beforeEach(async ({ mockApi }) => {
		await mockApi.get('/mock/purge');
	});

	test.describe('A11y checks', () => {
		test('Has no detectable a11y violations on registration page', async ({
			page,
		}) => {
			await page.goto('/register');
			await injectAndCheckAxe(page);
			await page.goto('/register/email');
			await injectAndCheckAxe(page);
		});

		test('Has no detectable a11y violations on registration page with error', async ({
			mockApi,
			page,
		}) => {
			await page.goto('/register/email');
			await page.locator('input[name="email"]').fill('Invalid email');
			await mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/oauth2/.*/v1/interact',
					status: 500,
					body: {},
				},
			});
			await page.locator('[data-cy=main-form-submit-button]').click();
			await injectAndCheckAxe(page);
		});
	});

	test.describe('Registering', () => {
		test('shows recaptcha error message when reCAPTCHA token request fails', async ({
			page,
		}) => {
			await page.route(/.*google\.com\/recaptcha\/.*/, async (route) => {
				await route.abort('failed');
			});

			await page.goto(
				'/register/email?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout',
			);
			await page.locator('input[name="email"]').fill('placeholder@example.com');
			await page.locator('[data-cy=main-form-submit-button]').click();
			await expect(
				page.getByText('Google reCAPTCHA verification failed.'),
			).toBeVisible();
			await expect(
				page.getByText('If the problem persists please try the following:'),
			).toBeVisible();
		});
	});

	test.describe('General IDAPI failure', () => {
		test('displays a generic error message', async ({ mockApi, page }) => {
			await mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/oauth2/.*/v1/interact',
					status: 500,
					body: {},
				},
			});
			await page.goto(
				'/register/email?returnUrl=https%3A%2F%2Flocalhost%3A8861%2Fsignin',
			);

			await page.locator('input[name=email]').fill('example@example.com');
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(
				page.getByText('There was a problem registering, please try again.'),
			).toBeVisible();
		});
	});
});
