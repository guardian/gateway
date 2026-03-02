import { expect } from '@playwright/test';
import { test } from '../../fixtures/mockedApiRequest';
import { injectAndCheckAxe } from '../../helpers/accessibility';

test.describe('Change email', () => {
	test.describe('a11y checks', () => {
		test('Has no detectable a11y violations on change email complete page', async ({
			page,
		}) => {
			await page.goto('/change-email/complete');
			await injectAndCheckAxe(page);
		});

		test('Has no detectable a11y violations on change email error page', async ({
			page,
			mockApi,
		}) => {
			await mockApi.post('/mock', {
				headers: { 'Content-Type': 'application/json', 'x-status': '500' },
			});
			await page.goto('/change-email/token');
			await injectAndCheckAxe(page);
		});
	});

	test.describe('change email flow', () => {
		test('should be able to change email yo', async ({ page, mockApi }) => {
			await mockApi.post('/mock', {
				headers: { 'Content-Type': 'application/json', 'x-status': '200' },
			});

			await page.goto('/change-email/token');
			await page.waitForURL('/change-email/complete');
			await expect(
				page.getByText('Success! Your email address has been updated.'),
			).toBeVisible();
		});

		test('should be able to handle a change email error', async ({
			page,
			mockApi,
		}) => {
			await mockApi.post('/mock', {
				headers: { 'Content-Type': 'application/json', 'x-status': '500' },
			});
			await page.goto('/change-email/token');
			await expect(
				page.getByText(
					'The email change link you followed has expired or was invalid.',
				),
			).toBeVisible();
		});
	});
});
