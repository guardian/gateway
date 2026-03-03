import { test, expect } from '@playwright/test';
import { randomMailosaurEmail } from '../../helpers/api/idapi';
import { createTestUser, updateTestUser } from '../../helpers/api/idapi';
import { checkForEmailAndGetDetails } from '../../helpers/api/mailosaur';

test.describe('Change email', () => {
	test.describe('successful and unsuccesful flows', () => {
		test('change email flow successful', async ({ request, page }) => {
			const { idapiUserId } = await createTestUser(request, {
				isUserEmailValidated: true,
			});
			const timeRequestWasMade = new Date();
			const newEmail = randomMailosaurEmail();

			// Updating the user's email address sends them
			// an email with a link to confirm the change
			await updateTestUser(request, idapiUserId, {
				primaryEmailAddress: newEmail,
			});

			const { token } = await checkForEmailAndGetDetails(
				newEmail,
				timeRequestWasMade,
				/change-email\/([^"]*)/,
			);

			await page.goto(`/change-email/${token}`);
			await expect(
				page.getByText('Success! Your email address has been updated.'),
			).toBeVisible();
		});

		test('change email flow unsuccessful', async ({ page }) => {
			await page.goto(`/change-email/bad_token`);
			await expect(
				page.getByText(
					'The email change link you followed has expired or was invalid.',
				),
			).toBeVisible();
		});
	});
});
