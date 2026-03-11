import { test, expect } from '@playwright/test';
import { Status } from '../../../src/server/models/okta/User';
import {
	randomMailosaurEmail,
	randomPassword,
	createTestUser,
} from '../../helpers/api/idapi';
import { checkForEmailAndGetDetails } from '../../helpers/api/mailosaur';
import {
	activateTestOktaUser,
	resetOktaUserPassword,
	expireOktaUserPassword,
	getTestOktaUser,
} from '../../helpers/api/okta';
import { existingUserSendEmailAndValidatePasscode } from '../../helpers/register';

test.describe('Registration flow - Split 2/4', () => {
	test.describe('existing user going through registration flow', () => {
		// set up useful variables
		const returnUrl =
			'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';
		const encodedReturnUrl = encodeURIComponent(returnUrl);
		const appClientId = 'appClientId1';
		const fromURI = '/oauth2/v1/authorize';

		test.describe('ACTIVE user - with email authenticator', () => {
			test('Should sign in with passcode', async ({ page, request }) => {
				const { emailAddress } = await createTestUser(request, {
					isUserEmailValidated: true,
				});

				await existingUserSendEmailAndValidatePasscode({
					page,
					request,
					emailAddress,
				});
			});

			test('should sign in with passcode - preserve returnUrl', async ({
				page,
				request,
			}) => {
				const { emailAddress } = await createTestUser(request, {
					isUserEmailValidated: true,
				});

				await existingUserSendEmailAndValidatePasscode({
					page,
					request,
					emailAddress,
					expectedReturnUrl: returnUrl,
					params: `returnUrl=${encodedReturnUrl}`,
				});
			});

			test('should sign in with passcode - preserve fromURI', async ({
				page,
				request,
			}) => {
				const { emailAddress } = await createTestUser(request, {
					isUserEmailValidated: true,
				});

				await existingUserSendEmailAndValidatePasscode({
					page,
					request,
					emailAddress,
					expectedReturnUrl: fromURI,
					params: `fromURI=${fromURI}&appClientId=${appClientId}`,
				});
			});

			test('should sign in with passcode - resend email', async ({
				page,
				request,
			}) => {
				const { emailAddress } = await createTestUser(request, {
					isUserEmailValidated: true,
				});

				await existingUserSendEmailAndValidatePasscode({
					page,
					request,
					emailAddress,
					additionalTests: 'resend-email',
				});
			});

			test('should sign in with passcode - change email', async ({
				page,
				request,
			}) => {
				const { emailAddress } = await createTestUser(request, {
					isUserEmailValidated: true,
				});

				await existingUserSendEmailAndValidatePasscode({
					page,
					request,
					emailAddress,
					additionalTests: 'change-email',
				});
			});

			test('should sign in with passcode - passcode incorrect', async ({
				page,
				request,
			}) => {
				const { emailAddress } = await createTestUser(request, {
					isUserEmailValidated: true,
				});

				await existingUserSendEmailAndValidatePasscode({
					page,
					request,
					emailAddress,
					additionalTests: 'passcode-incorrect',
				});
			});
		});

		test('should redirect with error when multiple passcode attempts fail', async ({
			page,
			request,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.context().addCookies([
				{
					name: 'playwright-mock-state',
					value: '1',
					domain: process.env.BASE_URI,
					path: '/',
				},
			]);

			await page.goto('/register/email');
			await page.locator('input[name=email]').clear();
			await page.locator('input[name=email]').fill(emailAddress);

			const timeRequestWasMade = new Date();
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
			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Enter your one-time code')).toBeVisible();

			// attempt 1 - auto submit
			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill('000000');
			await expect(page.getByText('Incorrect code')).toBeVisible();
			await expect(page).toHaveURL(/\/passcode/);

			// attempt 2 - manual submit
			await page.locator('input[name=code]').fill('000000');
			await page.getByText('Submit verification code').click();
			await expect(page.getByText('Incorrect code')).toBeVisible();
			await expect(page).toHaveURL(/\/passcode/);

			// attempt 3
			await page.locator('input[name=code]').fill('000000');
			await page.getByText('Submit verification code').click();
			await expect(page.getByText('Incorrect code')).toBeVisible();
			await expect(page).toHaveURL(/\/passcode/);

			// attempt 4
			await page.locator('input[name=code]').fill('000000');
			await page.getByText('Submit verification code').click();
			await expect(page.getByText('Incorrect code')).toBeVisible();
			await expect(page).toHaveURL(/\/passcode/);

			// attempt 5
			await page.locator('input[name=code]').fill('000000');
			await page.getByText('Submit verification code').click();
			await expect(page).toHaveURL(/\/register\/email/);
			await expect(page.getByText('Your code has expired')).toBeVisible();
		});

		test.describe('ACTIVE user - with only password authenticator', () => {
			test('should sign in with passcode', async ({ page, request }) => {
				/**
				 * START - SETUP USER WITH ONLY PASSWORD AUTHENTICATOR
				 */
				const emailAddress = randomMailosaurEmail();
				await page.goto('/register/email');

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

				// make sure we don't use a passcode
				// we instead reset their password using classic flow to set a password
				await page.goto('/reset-password?useOktaClassic=true');

				const timeRequestWasMade2 = new Date();
				await page.locator('input[name=email]').clear();
				await page.locator('input[name=email]').fill(emailAddress);
				await page.locator('[data-cy="main-form-submit-button"]').click();

				const { links, body: body2 } = await checkForEmailAndGetDetails(
					emailAddress,
					timeRequestWasMade2,
					/\/set-password\/([^"]*)/,
				);

				expect(body2).toContain('Welcome back');
				expect(body2).toContain('Create password');
				expect(links.length).toBe(2);
				const setPasswordLink = links.find((s) =>
					s.text?.includes('Create password'),
				);

				await page.goto(setPasswordLink?.href as string);

				const password = randomPassword();
				await page.locator('input[name=password]').fill(password);

				await page.locator('[data-cy="main-form-submit-button"]').click();
				await expect(page.getByText('Password created')).toBeVisible();
				await expect(page.getByText(emailAddress.toLowerCase())).toBeVisible();

				/**
				 * END - SETUP USER WITH ONLY PASSWORD AUTHENTICATOR
				 */
				await page.goto('/signin');
				await page.getByText('Sign in with a different email').click();
				await existingUserSendEmailAndValidatePasscode({
					page,
					request,
					emailAddress,
					expectedEmailBody: 'Your verification code',
				});
			});
		});

		test.describe('non-ACTIVE user', () => {
			test('STAGED user - should sign in with passcode', async ({
				page,
				request,
			}) => {
				const { emailAddress } = await createTestUser(request, {
					isGuestUser: true,
				});

				const oktaUser = await getTestOktaUser(request, emailAddress);
				expect(oktaUser.status).toBe(Status.STAGED);

				await existingUserSendEmailAndValidatePasscode({
					page,
					request,
					emailAddress,
				});
			});

			test('PROVISIONED user - should sign in with passcode', async ({
				page,
				request,
			}) => {
				const { emailAddress } = await createTestUser(request, {
					isGuestUser: true,
				});

				await activateTestOktaUser(request, emailAddress);

				const oktaUser = await getTestOktaUser(request, emailAddress);
				expect(oktaUser.status).toBe(Status.PROVISIONED);

				await existingUserSendEmailAndValidatePasscode({
					page,
					request,
					emailAddress,
				});
			});

			test('RECOVERY user - should sign in with passcode', async ({
				page,
				request,
			}) => {
				const { emailAddress } = await createTestUser(request, {
					isGuestUser: false,
				});

				await resetOktaUserPassword(request, emailAddress);

				const oktaUser = await getTestOktaUser(request, emailAddress);
				expect(oktaUser.status).toBe(Status.RECOVERY);

				await existingUserSendEmailAndValidatePasscode({
					page,
					request,
					emailAddress,
				});
			});

			test('PASSWORD_EXPIRED user - should sign in with passcode', async ({
				page,
				request,
			}) => {
				const { emailAddress } = await createTestUser(request, {
					isGuestUser: false,
				});

				await expireOktaUserPassword(request, emailAddress);

				const oktaUser = await getTestOktaUser(request, emailAddress);
				expect(oktaUser.status).toBe(Status.PASSWORD_EXPIRED);

				await existingUserSendEmailAndValidatePasscode({
					page,
					request,
					emailAddress,
				});
			});
		});
	});

	// after launching passcodes for all users, these users should no longer be generated, as using passcodes
	// will automatically transition them to ACTIVE
	// this test is kept for posterity
	test.describe('Passcode limbo state - user does not set password after using passcode', () => {
		test('allows the user to recover from the STAGED state when going through register flow', async ({
			page,
		}) => {
			await page.route('https://api.pwnedpasswords.com/range/*', (route) =>
				route.fulfill({ status: 200, body: '' }),
			);

			const emailAddress = randomMailosaurEmail();
			await page.goto('/register/email?useSetPassword=true');

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
			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill(code!);

			// password page
			await expect(page).toHaveURL(/\/welcome\/password/);

			// user now in limbo state where they have not set a password
			// recover by going through classic flow
			await page.goto('/register/email?useOktaClassic=true');

			const timeRequestWasMade2 = new Date();
			await page.locator('input[name=email]').clear();
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();

			const { links, body: body2 } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade2,
				/\/set-password\/([^"]*)/,
			);

			expect(body2).toContain('This account already exists');
			expect(body2).toContain('Create password');
			expect(links.length).toBe(2);
			const setPasswordLink = links.find((s) =>
				s.text?.includes('Create password'),
			);

			await page.goto(setPasswordLink?.href as string);
			await expect(page.getByText('Create password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();

			await page.locator('input[name=password]').fill(randomPassword());

			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page.getByText('Password created')).toBeVisible();
			await expect(page.getByText(emailAddress.toLowerCase())).toBeVisible();
		});

		test('allows the user to recover from the PROVISIONED state when going through reset password flow', async ({
			page,
			request,
		}) => {
			await page.route('https://api.pwnedpasswords.com/range/*', (route) =>
				route.fulfill({ status: 200, body: '' }),
			);

			const emailAddress = randomMailosaurEmail();
			await page.goto('/register/email?useSetPassword=true');

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
			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill(code!);

			// password page
			await expect(page).toHaveURL(/\/welcome\/password/);

			// transition user to PROVISIONED state
			await activateTestOktaUser(request, emailAddress);

			// user now in limbo state where they have not set a password
			// recover by going through classic flow
			await page.goto('/register/email?useOktaClassic=true');

			const timeRequestWasMade2 = new Date();
			await page.locator('input[name=email]').clear();
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();

			const { links, body: body2 } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade2,
				/\/set-password\/([^"]*)/,
			);

			expect(body2).toContain('This account already exists');
			expect(body2).toContain('Create password');
			expect(links.length).toBe(2);
			const setPasswordLink = links.find((s) =>
				s.text?.includes('Create password'),
			);

			await page.goto(setPasswordLink?.href as string);
			await expect(page.getByText('Create password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();

			await page.locator('input[name=password]').fill(randomPassword());

			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page.getByText('Password created')).toBeVisible();
			await expect(page.getByText(emailAddress.toLowerCase())).toBeVisible();
		});
	});
});
