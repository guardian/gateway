import { test, expect } from '@playwright/test';
import { Status } from '../../../src/server/models/okta/User';
import {
	randomMailosaurEmail,
	randomPassword,
	createTestUser,
} from '../../helpers/api/idapi';
import { checkForEmailAndGetDetails } from '../../helpers/api/mailosaur';
import {
	getTestOktaUser,
	resetOktaUserPassword,
	expireOktaUserPassword,
} from '../../helpers/api/okta';

test.describe('Password reset recovery flows - with Passcodes', () => {
	test.describe('RECOVERY user', () => {
		test('allows the user to change their password - RECOVERY', async ({
			request,
			page,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: false,
			});

			await resetOktaUserPassword(request, emailAddress);

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.RECOVERY);

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

	test.describe('PASSWORD_EXPIRED user', () => {
		test('allows the user to change their password - PASSWORD_EXPIRED', async ({
			request,
			page,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: false,
			});

			await expireOktaUserPassword(request, emailAddress);

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.PASSWORD_EXPIRED);

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

	test.describe('NON_EXISTENT user', () => {
		test('shows the passcode page with no account info, and using passcode returns error', async ({
			page,
		}) => {
			const emailAddress = randomMailosaurEmail();
			await page.goto(`/reset-password`);

			await expect(page.getByText('Reset password')).toBeVisible();
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			// passcode page
			await expect(page).toHaveURL(/\/reset-password\/email-sent/);
			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText('Don’t have an account?')).toBeVisible();

			await expect(page.getByText('Submit one-time code')).toBeVisible();
			await page.locator('input[name=code]').clear();
			await page.locator('input[name=code]').fill('123456');

			await expect(page).toHaveURL(/\/reset-password\/code/);
			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText('Don’t have an account?')).toBeVisible();

			await expect(page.getByText('Incorrect code')).toBeVisible();
		});

		test('should redirect with error when multiple passcode attempts fail', async ({
			page,
		}) => {
			const emailAddress = randomMailosaurEmail();
			await page.goto(`/reset-password`);

			await expect(page.getByText('Reset password')).toBeVisible();
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			// passcode page
			await expect(page).toHaveURL(/\/reset-password\/email-sent/);
			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText('Don’t have an account?')).toBeVisible();

			// attempt 1
			await expect(page.getByText('Submit one-time code')).toBeVisible();
			await page.locator('input[name=code]').fill('123456');
			await expect(page).toHaveURL(/\/reset-password\/code/);
			await expect(page.getByText('Incorrect code')).toBeVisible();

			// attempt 2
			await page.locator('input[name=code]').fill('123456');
			await page.getByText('Submit one-time code').click();
			await expect(page).toHaveURL(/\/reset-password\/code/);
			await expect(page.getByText('Incorrect code')).toBeVisible();

			// attempt 3
			await page.locator('input[name=code]').fill('123456');
			await page.getByText('Submit one-time code').click();
			await expect(page).toHaveURL(/\/reset-password\/code/);
			await expect(page.getByText('Incorrect code')).toBeVisible();

			// attempt 4
			await page.locator('input[name=code]').fill('123456');
			await page.getByText('Submit one-time code').click();
			await expect(page).toHaveURL(/\/reset-password\/code/);
			await expect(page.getByText('Incorrect code')).toBeVisible();

			// attempt 5
			await page.locator('input[name=code]').fill('123456');
			await page.getByText('Submit one-time code').click();
			await expect(page).toHaveURL(/\/reset-password/);
			await expect(page.getByText('Your code has expired')).toBeVisible();
		});
	});
});
