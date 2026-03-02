import { expect } from '@playwright/test';
import { test } from '../../fixtures/mockedApiRequest';
import { injectAndCheckAxe } from '../../helpers/accessibility';

test.describe('Sign in flow', () => {
	test.beforeEach(async ({ mockApi }) => {
		await mockApi.get('/mock/purge');
	});

	test.describe('A11y checks', () => {
		test('Has no detectable a11y violations on sign in page', async ({
			page,
		}) => {
			await page.goto('/signin?usePasswordSignIn=true');
			await injectAndCheckAxe(page);
		});

		test('Has no detectable a11y violations on sign in page with error', async ({
			page,
			mockApi,
		}) => {
			await page.goto('/signin?usePasswordSignIn=true');
			await page.locator('input[name="email"]').fill('Invalid email');
			await page.locator('input[name="password"]').fill('Invalid password');
			await mockApi.post('/mock/permanent-pattern', {
				data: { pattern: '/api/v1/users/.*', status: 500, body: {} },
			});
			await page.locator('[data-cy=main-form-submit-button]').click();
			await injectAndCheckAxe(page);
		});
	});

	test.describe('Signing in', () => {
		test('auto-fills the email field when encryptedEmail is successfully decrypted', async ({
			page,
			mockApi,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/signin-token/token/bdfalrbagbgu',
					status: 200,
					body: { status: 'ok', email: 'test@test.com' },
				},
			});
			await page.goto('/signin?encryptedEmail=bdfalrbagbgu');
			await expect(page.locator('input[name="email"]')).toHaveValue(
				'test@test.com',
			);
		});

		test('shows recaptcha error message when reCAPTCHA token request fails', async ({
			page,
		}) => {
			// Intercept "Report this error" link because we just check it is linked to.
			await page.route(
				'https://manage.theguardian.com/help-centre/contact-us',
				async (route) => {
					await route.fulfill({ status: 200 });
				},
			);
			await page.route(/.*google.com\/recaptcha\/.*/, async (route) => {
				await route.abort('failed');
			});
			await page.goto(
				'/signin?returnUrl=https%3A%2F%2Fwww.theguardian.com%2Fabout&usePasswordSignIn=true',
			);
			await page.locator('input[name="email"]').fill('placeholder@example.com');
			await page
				.locator('input[name="password"]')
				.fill('definitelynotarealpassword');

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
		test('displays a generic error message', async ({ page, mockApi }) => {
			await mockApi.post('/mock/permanent-pattern', {
				data: { pattern: '/api/v1/users/.*', status: 500, body: {} },
			});
			await page.goto(
				'/signin?returnUrl=https%3A%2F%2Flocalhost%3A8861%2Fsignin&usePasswordSignIn=true',
			);
			await page.locator('input[name="email"]').fill('example@example.com');
			await page.locator('input[name="password"]').fill('password');
			await page.locator('[data-cy=main-form-submit-button]').click();
			await expect(
				page.getByText('There was a problem signing in, please try again'),
			).toBeVisible();
		});
	});
});
