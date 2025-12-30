import { expect } from '@playwright/test';
import { test } from '../../fixtures/mockedApiRequest';
import { injectAndCheckAxe } from '../../helpers/accessibility';

test.describe('Consent token accept flow', () => {
	test.beforeEach(async ({ mockApi }) => {
		await mockApi.get('/mock/purge');
	});

	test.describe('a11y checks', () => {
		test('Has no detectable a11y violations on consent token expired page', async ({
			page,
		}) => {
			await page.goto('/consent-token/abc123/accept');
			await injectAndCheckAxe(page);
		});

		test('Has no detectable a11y violations on consent token email sent page', async ({
			page,
		}) => {
			await page.goto('/consent-token/abc123/accept');
			await page.locator('button[type=submit]').click();
			await injectAndCheckAxe(page);
		});
	});

	test.describe('consent token flow', () => {
		test('shows the email sent page when supplied a valid, expired token', async ({
			page,
			mockApi,
		}) => {
			const expiredToken = 'expired-consent-token';
			await mockApi.post('/mock', {
				headers: { 'Content-Type': 'application/json', 'x-status': '403' },
			});
			await page.goto(`/consent-token/${expiredToken}/accept`);
			await expect(page.getByText('This link has expired.')).toBeVisible();
			await page.locator('button[type=submit]').click();
			await expect(page).toHaveURL(/\/consent-token\/email-sent/);
			await expect(page.getByText('Check your inbox')).toBeVisible();
		});
	});
});
