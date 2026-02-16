import { test, expect } from '@playwright/test';
import { Status } from '../../../src/server/models/okta/User';
import { randomMailosaurEmail, createTestUser } from '../../helpers/api/idapi';
import { checkForEmailAndGetDetails } from '../../helpers/api/mailosaur';
import {
	activateTestOktaUser,
	resetOktaUserPassword,
	expireOktaUserPassword,
	getTestOktaUser,
} from '../../helpers/api/okta';

test.describe('Registration flow - Split 2/3', () => {
	test.describe('Existing users asking for an email to be resent after attempting to register with Okta - useOktaClassic', () => {
		test('should resend a STAGED user a set password email with an Okta activation token', async ({
			page,
			request,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: true,
				isUserEmailValidated: true,
			});

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.STAGED);

			await page.goto('/register/email?useOktaClassic=true');

			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			// Wait for the first email to arrive...
			await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/\/set-password\/([^"]*)/,
			);

			const timeRequestWasMade2 = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			// ...before waiting for the second email to arrive
			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade2,
				/\/set-password\/([^"]*)/,
			);

			expect(body).toContain('This account already exists');
			expect(body).toContain('Create password');
			expect(links.length).toBe(2);
			const setPasswordLink = links.find((s) =>
				s.text?.includes('Create password'),
			);
			expect(setPasswordLink?.href ?? '').not.toContain('useOkta=true');
			await page.goto(setPasswordLink?.href as string);
			await expect(page.getByText('Create password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
		});

		test('should resend a PROVISIONED user a set password email with an Okta activation token', async ({
			page,
			request,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: true,
				isUserEmailValidated: true,
			});

			await activateTestOktaUser(request, emailAddress);

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.PROVISIONED);

			await page.goto('/register/email?useOktaClassic=true');

			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/\/set-password\/([^"]*)/,
			);

			const timeRequestWasMade2 = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade2,
				/\/set-password\/([^"]*)/,
			);

			expect(body).toContain('This account already exists');
			expect(body).toContain('Create password');
			expect(links.length).toBe(2);
			const setPasswordLink = links.find((s) =>
				s.text?.includes('Create password'),
			);
			expect(setPasswordLink?.href ?? '').not.toContain('useOkta=true');
			await page.goto(setPasswordLink?.href as string);
			await expect(page.getByText('Create password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
		});

		test('should send an ACTIVE user a reset password email with an Okta activation token', async ({
			page,
			request,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: false,
				isUserEmailValidated: true,
			});

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.ACTIVE);

			await page.goto('/register/email?useOktaClassic=true');
			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			await checkForEmailAndGetDetails(emailAddress, timeRequestWasMade);

			const timeRequestWasMade2 = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade2,
				/reset-password\/([^"]*)/,
			);

			expect(body).toContain('This account already exists');
			expect(body).toContain('Sign in');
			expect(body).toContain('Reset password');
			expect(links.length).toBe(3);
			const resetPasswordLink = links.find((s) =>
				s.text?.includes('Reset password'),
			);
			expect(resetPasswordLink?.href ?? '').not.toContain('useOkta=true');
			await page.goto(resetPasswordLink?.href as string);
			await expect(page.getByText('Create new password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
		});

		test('should send a RECOVERY user a reset password email with an Okta activation token', async ({
			page,
			request,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: false,
				isUserEmailValidated: true,
			});

			await resetOktaUserPassword(request, emailAddress);

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.RECOVERY);

			await page.goto('/register/email?useOktaClassic=true');
			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/reset-password\/([^"]*)/,
			);

			const timeRequestWasMade2 = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade2,
				/reset-password\/([^"]*)/,
			);

			expect(body).toContain('Password reset');
			expect(body).toContain('Reset password');
			expect(links.length).toBe(3);
			const resetPasswordLink = links.find((s) =>
				s.text?.includes('Reset password'),
			);
			expect(resetPasswordLink?.href ?? '').not.toContain('useOkta=true');
			await page.goto(resetPasswordLink?.href as string);
			await expect(page.getByText('Create new password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
		});

		test('should send a PASSWORD_EXPIRED user a reset password email with an Okta activation token', async ({
			page,
			request,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: false,
				isUserEmailValidated: true,
			});

			await expireOktaUserPassword(request, emailAddress);

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.PASSWORD_EXPIRED);

			await page.goto('/register/email?useOktaClassic=true');
			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/reset-password\/([^"]*)/,
			);

			const timeRequestWasMade2 = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade2,
				/reset-password\/([^"]*)/,
			);

			expect(body).toContain('Password reset');
			expect(body).toContain('Reset password');
			expect(links.length).toBe(3);
			const resetPasswordLink = links.find((s) =>
				s.text?.includes('Reset password'),
			);
			expect(resetPasswordLink?.href ?? '').not.toContain('useOkta=true');
			await page.goto(resetPasswordLink?.href as string);
			await expect(page.getByText('Create new password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
		});
	});

	test.describe('Welcome Page - Resend (Link expired)', () => {
		test('send an email for user with no existing account', async ({
			page,
		}) => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();

			await page.goto(`/welcome/resend?returnUrl=${encodedReturnUrl}`);

			const timeRequestWasMade = new Date();
			await page.locator('input[name=email]').fill(unregisteredEmail);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText(unregisteredEmail)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			const { body, codes } = await checkForEmailAndGetDetails(
				unregisteredEmail,
				timeRequestWasMade,
			);

			// email
			expect(body).toContain('Your verification code');
			expect(codes?.length).toBe(1);
			const code = codes?.[0].value;
			expect(code).toMatch(/^\d{6}$/);

			// passcode page
			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill(code!);

			await expect(page).toHaveURL(/\/welcome\/review/);

			// we are reloading here to make sure the params are persisted even on page refresh
			await page.reload();

			await expect(page).toHaveURL(new RegExp(encodedReturnUrl));
		});

		test('should resend a STAGED user a set password email with an Okta activation token', async ({
			page,
			request,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: true,
				isUserEmailValidated: true,
			});

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.STAGED);

			await page.goto('/welcome/resend?useOktaClassic=true');

			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			// Wait for the first email to arrive...
			await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/\/set-password\/([^"]*)/,
			);

			const timeRequestWasMade2 = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			// ...before waiting for the second email to arrive
			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade2,
				/\/set-password\/([^"]*)/,
			);

			expect(body).toContain('This account already exists');
			expect(body).toContain('Create password');
			expect(links.length).toBe(2);
			const setPasswordLink = links.find((s) =>
				s.text?.includes('Create password'),
			);
			expect(setPasswordLink?.href ?? '').not.toContain('useOkta=true');
			await page.goto(setPasswordLink?.href as string);
			await expect(page.getByText('Create password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
		});

		test('should resend a PROVISIONED user a set password email with an Okta activation token', async ({
			page,
			request,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: true,
				isUserEmailValidated: true,
			});

			await activateTestOktaUser(request, emailAddress);

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.PROVISIONED);

			await page.goto('/welcome/resend?useOktaClassic=true');

			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/\/set-password\/([^"]*)/,
			);

			const timeRequestWasMade2 = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade2,
				/\/set-password\/([^"]*)/,
			);

			expect(body).toContain('This account already exists');
			expect(body).toContain('Create password');
			expect(links.length).toBe(2);
			const setPasswordLink = links.find((s) =>
				s.text?.includes('Create password'),
			);
			expect(setPasswordLink?.href ?? '').not.toContain('useOkta=true');
			await page.goto(setPasswordLink?.href as string);
			await expect(page.getByText('Create password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
		});

		test('should send an ACTIVE user a reset password email with an activation token', async ({
			page,
			request,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: false,
				isUserEmailValidated: true,
			});

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.ACTIVE);

			await page.goto('/welcome/resend?useOktaClassic=true');
			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			await checkForEmailAndGetDetails(emailAddress, timeRequestWasMade);

			const timeRequestWasMade2 = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade2,
				/reset-password\/([^"]*)/,
			);

			expect(body).toContain('This account already exists');
			expect(body).toContain('Sign in');
			expect(body).toContain('Reset password');
			expect(links.length).toBe(3);
			const resetPasswordLink = links.find((s) =>
				s.text?.includes('Reset password'),
			);
			expect(resetPasswordLink?.href ?? '').not.toContain('useOkta=true');
			await page.goto(resetPasswordLink?.href as string);
			await expect(page.getByText('Create new password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
		});

		test('should send a RECOVERY user a reset password email with an Okta activation token', async ({
			page,
			request,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: false,
				isUserEmailValidated: true,
			});

			await resetOktaUserPassword(request, emailAddress);

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.RECOVERY);

			await page.goto('/welcome/resend?useOktaClassic=true');
			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/reset-password\/([^"]*)/,
			);

			const timeRequestWasMade2 = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade2,
				/reset-password\/([^"]*)/,
			);

			expect(body).toContain('Password reset');
			expect(body).toContain('Reset password');
			expect(links.length).toBe(3);
			const resetPasswordLink = links.find((s) =>
				s.text?.includes('Reset password'),
			);
			expect(resetPasswordLink?.href ?? '').not.toContain('useOkta=true');
			await page.goto(resetPasswordLink?.href as string);
			await expect(page.getByText('Create new password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
		});

		test('should send a PASSWORD_EXPIRED user a reset password email with an Okta activation token', async ({
			page,
			request,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: false,
				isUserEmailValidated: true,
			});

			await expireOktaUserPassword(request, emailAddress);

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.PASSWORD_EXPIRED);

			await page.goto('/welcome/resend?useOktaClassic=true');
			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/reset-password\/([^"]*)/,
			);

			const timeRequestWasMade2 = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade2,
				/reset-password\/([^"]*)/,
			);

			expect(body).toContain('Password reset');
			expect(body).toContain('Reset password');
			expect(links.length).toBe(3);
			const resetPasswordLink = links.find((s) =>
				s.text?.includes('Reset password'),
			);
			expect(resetPasswordLink?.href ?? '').not.toContain('useOkta=true');
			await page.goto(resetPasswordLink?.href as string);
			await expect(page.getByText('Create new password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
		});
	});

	test.describe('Okta session exists on /signin', () => {
		test.beforeEach(async ({ page }) => {
			// Intercept the external redirect page.
			// We just want to check that the redirect happens, not that the page loads.
			await page.route('https://m.code.dev-theguardian.com/', async (route) => {
				await route.fulfill({ status: 200 });
			});
		});

		test('shows the signed in as page', async ({ page, request }) => {
			// Create a validated test user
			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			// Sign our new user in
			await page.goto(
				`/signin?returnUrl=${encodeURIComponent(
					`https://${process.env.BASE_URI}/welcome/review`,
				)}&usePasswordSignIn=true`,
			);
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page).toHaveURL(/\/welcome\/review/);

			// Get the current session data
			const cookies = await page.context().cookies();
			const idxCookie = cookies.find((c) => c.name === 'idx');
			expect(idxCookie).toBeDefined();

			// Visit register again
			await page.goto(
				`/register/email?returnUrl=${encodeURIComponent(
					`https://${process.env.BASE_URI}/welcome/review`,
				)}`,
			);
			await expect(page).toHaveURL(/\/register/);

			await expect(page.getByText('Sign in to the Guardian')).toBeVisible();
			await expect(page.getByText('You are signed in with')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();

			const continueLink = page.getByRole('link', { name: 'Continue' });
			await expect(continueLink).toHaveAttribute(
				'href',
				new RegExp(
					`https://${process.env.BASE_URI}/signin/refresh\\?returnUrl=https%3A%2F%2Fprofile.thegulocal.com%2Fwelcome%2Freview`,
				),
			);

			const signInLink = page.getByRole('link', { name: 'Sign in' });
			await expect(signInLink).toHaveAttribute('href', /\/signout\?returnUrl=/);

			await expect(
				page.getByText('Sign in with a different email'),
			).toBeVisible();
		});
	});
});
