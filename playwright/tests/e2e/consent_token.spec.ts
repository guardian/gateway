import { test, expect } from '@playwright/test';
import { createTestUser, sendConsentEmail } from '../../helpers/api/idapi';
import { checkForEmailAndGetDetails } from '../../helpers/api/mailosaur';

test.describe('Consent token flow', () => {
	test('shows the success page when supplied a valid token by a logged in user', async ({
		request,
		page,
	}) => {
		const { emailAddress } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		const timeRequestWasMade = new Date();

		await sendConsentEmail(request, {
			emailAddress,
			consents: ['jobs'],
		});

		const { token } = await checkForEmailAndGetDetails(
			emailAddress,
			timeRequestWasMade,
			/consent-token\/([^"]*)\//,
		);

		await page.goto(`/consent-token/${token}/accept`, {
			waitUntil: 'networkidle',
		});
		await expect(page.getByText('Subscribe Confirmation')).toBeVisible();
		// TODO: Would be nice to check that the user is actually
		// subscribed to the newsletters here
		await expect(page).toHaveURL(/\/subscribe\/success/);
	});

	test('shows the email sent page when supplied an invalid token', async ({
		page,
	}) => {
		const invalidToken = 'invalid-consent-token';
		await page.goto(`/consent-token/${invalidToken}/accept`);
		await expect(page.getByText('This link has expired.')).toBeVisible();
		await page.locator('button[type=submit]').click();
		await expect(page).toHaveURL(/\/consent-token\/email-sent/);
		await expect(page.getByText('Check your inbox')).toBeVisible();
	});
});
