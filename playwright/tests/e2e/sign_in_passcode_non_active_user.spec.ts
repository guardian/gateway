import { test, expect } from '@playwright/test';
import { Status } from '../../../src/server/models/okta/User';
import { createTestUser } from '../../helpers/api/idapi';
import {
	activateTestOktaUser,
	resetOktaUserPassword,
	expireOktaUserPassword,
	getTestOktaUser,
} from '../../helpers/api/okta';
import { checkForEmailAndGetDetails } from '../../helpers/api/mailosaur';

test.describe('Sign In flow, with passcode (part 1)', () => {
	const returnUrl =
		'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';
	const fromURI = '/oauth2/v1/authorize';

	test.beforeEach(async ({ page }) => {
		await page.route('https://m.code.dev-theguardian.com/', async (route) => {
			await route.fulfill({ status: 200 });
		});
		await page.route(returnUrl, async (route) => {
			await route.fulfill({ status: 200 });
		});
		await page.route(
			`https://${process.env.BASE_URI}${decodeURIComponent(fromURI)}`,
			async (route) => {
				await route.fulfill({ status: 200 });
			},
		);
	});

	test.describe('non-ACTIVE user', () => {
		test('STAGED user - should sign in with passcode', async ({
			request,
			page,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: true,
			});

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.STAGED);

			await page.goto('/signin');
			await page.locator('input[name=email]').fill(emailAddress);

			const timeRequestWasMade = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const { codes } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
			);

			// passcode page
			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText('Submit verification code')).toBeVisible();

			const code = codes?.[0].value;
			await page.locator('input[name=code]').fill(code!);

			await expect(page).toHaveURL(/\/welcome\/existing/);

			await page.getByRole('link', { name: 'Return to the Guardian' }).click();

			await expect(page).toHaveURL(/https:\/\/m\.code\.dev-theguardian\.com\//);

			// veryify the user is now ACTIVE
			const updatedUser = await getTestOktaUser(request, emailAddress);
			expect(updatedUser.status).toBe('ACTIVE');
			expect(updatedUser.profile.emailValidated).toBe(true);
		});

		test('PROVISIONED user - should sign in with passcode', async ({
			request,
			page,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: true,
			});

			await activateTestOktaUser(request, emailAddress);

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.PROVISIONED);

			await page.goto('/signin');
			await page.locator('input[name=email]').fill(emailAddress);

			const timeRequestWasMade = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const { codes } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
			);

			const code = codes?.[0].value;
			await page.locator('input[name=code]').fill(code!);

			// non-ACTIVE users are first redirected to the welcome/existing page
			await expect(page).toHaveURL(/\/welcome\/existing/);

			await page.getByRole('link', { name: 'Return to the Guardian' }).click();

			await expect(page).toHaveURL(/https:\/\/m\.code\.dev-theguardian\.com\//);

			// verify that the user is now ACTIVE with validated email
			const updatedUser = await getTestOktaUser(request, emailAddress);
			expect(updatedUser.status).toBe('ACTIVE');
			expect(updatedUser.profile.emailValidated).toBe(true);
		});

		test('RECOVERY user - should sign in with passcode', async ({
			request,
			page,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: false,
			});

			await resetOktaUserPassword(request, emailAddress);

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.RECOVERY);

			await page.goto('/signin');
			await page.locator('input[name=email]').fill(emailAddress);

			const timeRequestWasMade = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const { codes } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
			);

			const code = codes?.[0].value;
			await page.locator('input[name=code]').fill(code!);

			await expect(page).toHaveURL(/\/welcome\/existing/);

			await page.getByRole('link', { name: 'Return to the Guardian' }).click();

			await expect(page).toHaveURL(/https:\/\/m\.code\.dev-theguardian\.com\//);

			// verify that the user is now active with validated email
			const updatedUser = await getTestOktaUser(request, emailAddress);
			expect(updatedUser.status).toBe('ACTIVE');
			expect(updatedUser.profile.emailValidated).toBe(true);
		});

		test('PASSWORD_EXPIRED user - should sign in with passcode', async ({
			request,
			page,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: false,
			});

			await expireOktaUserPassword(request, emailAddress);

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.PASSWORD_EXPIRED);

			await page.goto('/signin');
			await page.locator('input[name=email]').fill(emailAddress);

			const timeRequestWasMade = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const { codes } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
			);

			const code = codes?.[0].value;
			await page.locator('input[name=code]').fill(code!);

			await expect(page).toHaveURL(/\/welcome\/existing/);

			await page.getByRole('link', { name: 'Return to the Guardian' }).click();

			await expect(page).toHaveURL(/https:\/\/m\.code\.dev-theguardian\.com\//);

			// verify that the user is now active with validated email
			const updatedUser = await getTestOktaUser(request, emailAddress);
			expect(updatedUser.status).toBe('ACTIVE');
			expect(updatedUser.profile.emailValidated).toBe(true);
		});
	});
});
