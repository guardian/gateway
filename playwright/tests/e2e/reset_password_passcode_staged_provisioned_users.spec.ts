import { test, expect } from '@playwright/test';
import { Status } from '../../../src/server/models/okta/User';
import {
	randomMailosaurEmail,
	randomPassword,
	createTestUser,
} from '../../helpers/api/idapi';
import { checkForEmailAndGetDetails } from '../../helpers/api/mailosaur';
import { getTestOktaUser, activateTestOktaUser } from '../../helpers/api/okta';

test.describe('Password reset recovery flows - with Passcodes', () => {
	test.describe('STAGED user', () => {
		test('allows the user to change their password - STAGED - No Passcode Verified', async ({
			request,
			page,
		}) => {
			const emailAddress = randomMailosaurEmail();
			await page.goto(`/register/email`);

			const timeRequestWasMade = new Date();
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();

			const { body, codes } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
			);

			// email
			expect(body).toContain('Your verification code');
			expect(codes?.length).toBe(1);
			const code = codes?.[0].value;
			expect(code).toMatch(/^\d{6}$/);

			// passcode page
			await expect(page).toHaveURL(/\/passcode/);

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.STAGED);

			// make sure we don't use a passcode
			// we instead reset their password using passcodes
			await page.goto('/reset-password');

			const timeRequestWasMade2 = new Date();
			await expect(page.getByText('Reset password')).toBeVisible();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const emailDetails2 = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade2,
			);

			// email
			expect(emailDetails2.body).toContain('Your verification code');
			expect(emailDetails2.codes?.length).toBe(1);
			const code2 = emailDetails2.codes?.[0].value;
			expect(code2).toMatch(/^\d{6}$/);

			// passcode page
			await expect(page).toHaveURL(/\/reset-password\/email-sent/);
			await expect(page.getByText('Enter your one-time code')).toBeVisible();

			await expect(page.getByText('Submit one-time code')).toBeVisible();
			await page.locator('input[name=code]').clear();
			await page.locator('input[name=code]').fill(code2!);

			await expect(page).toHaveURL(/\/set-password/);

			await page.locator('input[name="password"]').fill(randomPassword());
			await page.locator('button[type="submit"]').click();

			await expect(page).toHaveURL(/\/set-password\/complete/);
		});

		test('allows the user to change their password - STAGED - Created via Classic API (i.e guest user)', async ({
			request,
			page,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: true,
			});

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.STAGED);

			await page.goto('/reset-password');

			const timeRequestWasMade = new Date();
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const { body, codes } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
			);

			// email
			expect(body).toContain('Your one-time passcode');
			expect(codes?.length).toBe(1);
			const code = codes?.[0].value;
			expect(code).toMatch(/^\d{6}$/);

			// passcode page
			await expect(page).toHaveURL(/\/reset-password\/email-sent/);
			await expect(page.getByText('Enter your one-time code')).toBeVisible();

			await expect(page.getByText('Submit one-time code')).toBeVisible();
			await page.locator('input[name=code]').clear();
			await page.locator('input[name=code]').fill(code!);

			// password page
			await expect(page).toHaveURL(/\/reset-password\/password/);

			await page.locator('input[name="password"]').fill(randomPassword());
			await page.locator('button[type="submit"]').click();

			// password complete page
			await expect(page).toHaveURL(/\/reset-password\/complete/);

			await expect(page.getByText('Password updated')).toBeVisible();
		});
	});

	test.describe('PROVISIONED user', () => {
		test('allows the user to change their password - PROVISIONED', async ({
			request,
			page,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: true,
			});

			await activateTestOktaUser(request, emailAddress);

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.PROVISIONED);

			await page.goto('/reset-password');

			const timeRequestWasMade = new Date();
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const { body, codes } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
			);

			// email
			expect(body).toContain('Your one-time passcode');
			expect(codes?.length).toBe(1);
			const code = codes?.[0].value;
			expect(code).toMatch(/^\d{6}$/);

			// passcode page
			await expect(page).toHaveURL(/\/reset-password\/email-sent/);
			await expect(page.getByText('Enter your one-time code')).toBeVisible();

			await expect(page.getByText('Submit one-time code')).toBeVisible();
			await page.locator('input[name=code]').clear();
			await page.locator('input[name=code]').fill(code!);

			// password page
			await expect(page).toHaveURL(/\/reset-password\/password/);

			await page.locator('input[name="password"]').fill(randomPassword());
			await page.locator('button[type="submit"]').click();

			// password complete page
			await expect(page).toHaveURL(/\/reset-password\/complete/);

			await expect(page.getByText('Password updated')).toBeVisible();
		});
	});
});
