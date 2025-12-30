import { test, expect } from '@playwright/test';
import {
	randomMailosaurEmail,
	randomPassword,
	createTestUser,
} from '../../helpers/api/idapi';
import { checkForEmailAndGetDetails } from '../../helpers/api/mailosaur';
import { getTestOktaUser } from '../../helpers/api/okta';
import { mockClientRecaptcha } from '../../helpers/network/recaptcha';

test.describe('Sign In flow, with passcode', () => {
	// set up useful variables
	const returnUrl =
		'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';
	const encodedReturnUrl = encodeURIComponent(returnUrl);
	const appClientId = 'appClientId1';
	const fromURI = '/oauth2/v1/authorize';

	test.beforeEach(async ({ page }) => {
		await mockClientRecaptcha(page);
		// Intercept the external redirect pages.
		// We just want to check that the redirect happens, not that the page loads.
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

	test.describe('ACTIVE user - with email authenticator', () => {
		test('should sign in with passcode', async ({ request, page }) => {
			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto('/signin?usePasscodeSignIn=true');
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
			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill(code!);

			await expect(page).toHaveURL(/\/welcome\/existing/);
			await page.getByRole('link', { name: 'Return to the Guardian' }).click();

			await expect(page).toHaveURL(/https:\/\/m\.code\.dev-theguardian\.com\//);

			const updatedUser = await getTestOktaUser(request, emailAddress);
			expect(updatedUser.status).toBe('ACTIVE');
			expect(updatedUser.profile.emailValidated).toBe(true);
		});

		test('should sign in with passcode - preserve returnUrl', async ({
			request,
			page,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto(
				`/signin?usePasscodeSignIn=true&returnUrl=${encodedReturnUrl}`,
			);
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

			await expect(page).toHaveURL(returnUrl);
		});

		test('should sign in with passcode - preserve fromURI', async ({
			request,
			page,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto(`/signin?fromURI=${fromURI}&appClientId=${appClientId}`);
			await page.locator('input[name=email]').fill(emailAddress);

			const timeRequestWasMade = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Enter your one-time code')).toBeVisible();

			const { codes } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
			);

			const code = codes?.[0].value;
			await page.locator('input[name=code]').fill(code!);

			await expect(page).toHaveURL(new RegExp(fromURI));

			const updatedUser = await getTestOktaUser(request, emailAddress);
			expect(updatedUser.status).toBe('ACTIVE');
			expect(updatedUser.profile.emailValidated).toBe(true);
		});

		test('selects password option to sign in from initial sign in page', async ({
			request,
			page,
		}) => {
			// INFO: this is the original test we needed to mock recaptcha for

			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto(`/signin`);
			await page.locator('input[name=email]').fill(emailAddress);

			await page.getByText('Sign in with a password instead').click();

			// password page
			await expect(page).toHaveURL(/\/signin\/password/);

			await expect(page.locator('input[name=email]')).toHaveValue(emailAddress);

			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[type=submit]').click();

			await expect(page).toHaveURL(/https:\/\/m\.code\.dev-theguardian\.com/, {
				timeout: 30000,
			});
		});

		test('selects password option to sign in from the initial sign in page and show correct error page on incorrect password', async ({
			page,
		}) => {
			const emailAddress = randomMailosaurEmail();
			await page.goto(`/signin`);
			await page.locator('input[name=email]').fill(emailAddress);
			await page.getByText('Sign in with a password instead').click();

			// password page
			await expect(page).toHaveURL(/\/signin\/password/);
			await expect(page.locator('input[name=email]')).toHaveValue(emailAddress);
			await page.locator('input[name=password]').fill(randomPassword());
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page).toHaveURL(/\/signin\/password/);
			await expect(
				page.getByText('Email and password don’t match'),
			).toBeVisible();
		});

		test('selects password option to sign in from passcode page', async ({
			request,
			page,
		}) => {
			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto(`/signin?usePasscodeSignIn=true`);
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			// passcode page
			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await page.getByText('sign in with a password instead').click();

			// password page
			await expect(page).toHaveURL(/\/signin\/password/);
			await expect(page.locator('input[name=email]')).toHaveValue(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page).toHaveURL(/https:\/\/m\.code\.dev-theguardian\.com\//);
		});

		test('selects password option to sign in from passcode page and show correct error page on incorrect password', async ({
			page,
		}) => {
			const emailAddress = randomMailosaurEmail();
			await page.goto(`/signin`);
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();
			// passcode page
			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await page.getByText('sign in with a password instead').click();

			// password page
			await expect(page).toHaveURL(/\/signin\/password/);
			await expect(page.locator('input[name=email]')).toHaveValue(emailAddress);
			await page.locator('input[name=password]').fill(randomPassword());
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page).toHaveURL(/\/signin\/password/);
			await expect(
				page.getByText('Email and password don’t match'),
			).toBeVisible();
		});

		test('should sign in with passcode - resend email', async ({
			request,
			page,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.context().addCookies([
				{
					name: 'cypress-mock-state',
					value: '1',
					domain: process.env.BASE_URI,
					path: '/',
				},
			]);

			await page.goto('/signin?usePasscodeSignIn=true');
			await page.locator('input[name=email]').fill(emailAddress);

			const timeRequestWasMade = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const { codes } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
			);

			expect(codes?.length).toBe(1);

			// passcode page
			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Enter your one-time code')).toBeVisible();

			// resend email
			const timeRequestWasMade2 = new Date();
			await page.waitForTimeout(1000); // wait for the send again button to be enabled
			await page.getByText('send again').click();

			const emailDetails2 = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade2,
			);

			const code2 = emailDetails2.codes?.[0].value;
			expect(code2).toMatch(/^\d{6}$/);

			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill(code2!);

			await expect(page).toHaveURL(/https:\/\/m\.code\.dev-theguardian\.com\//);

			const updatedUser = await getTestOktaUser(request, emailAddress);
			expect(updatedUser.status).toBe('ACTIVE');
			expect(updatedUser.profile.emailValidated).toBe(true);
		});

		test('should sign in with passcode - change email', async ({
			request,
			page,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto('/signin?usePasscodeSignIn=true');
			await page.locator('input[name=email]').fill(emailAddress);

			const timeRequestWasMade = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await checkForEmailAndGetDetails(emailAddress, timeRequestWasMade);

			// passcode page
			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await page.getByText('try another address').click();

			await expect(page).toHaveURL(/\/signin/);
		});

		test('should sign in with passcode - passcode incorrect', async ({
			request,
			page,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto('/signin?usePasscodeSignIn=true');
			await page.locator('input[name=email]').fill(emailAddress);

			const timeRequestWasMade = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const { codes } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
			);

			const code = codes?.[0].value;
			expect(code).toMatch(/^\d{6}$/);

			// passcode page
			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText('Submit verification code')).toBeVisible();

			// enter incorrect code
			await page.locator('input[name=code]').fill(`${+code! + 1}`);

			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Incorrect code')).toBeVisible();

			// enter correct code
			await page.locator('input[name=code]').clear();
			await page.locator('input[name=code]').fill(code!);

			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.getByText('Submit verification code').click();

			await expect(page).toHaveURL(/\/welcome\/existing/);

			const updatedUser = await getTestOktaUser(request, emailAddress);
			expect(updatedUser.status).toBe('ACTIVE');
			expect(updatedUser.profile.emailValidated).toBe(true);
		});

		test('should redirect with error when multiple passcode attempts fail', async ({
			request,
			page,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto(`/signin?usePasscodeSignIn=true`);
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

			// attempt 1
			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill(`${+code! + 1}`);
			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Incorrect code')).toBeVisible();

			// attempt 2
			await page.locator('input[name=code]').fill(`${+code! + 1}`);
			await page.getByText('Submit verification code').click();
			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Incorrect code')).toBeVisible();

			// attempt 3
			await page.locator('input[name=code]').fill(`${+code! + 1}`);
			await page.getByText('Submit verification code').click();
			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Incorrect code')).toBeVisible();

			// attempt 4
			await page.locator('input[name=code]').fill(`${+code! + 1}`);
			await page.getByText('Submit verification code').click();
			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Incorrect code')).toBeVisible();

			// attempt 5
			await page.locator('input[name=code]').fill(`${+code! + 1}`);
			await page.getByText('Submit verification code').click();
			await expect(page).toHaveURL(/\/signin/);
			await expect(page.getByText('Your code has expired')).toBeVisible();
		});
	});

	test.describe('ACTIVE user - with only password authenticator', () => {
		test('should sign in with passcode', async ({ page }) => {
			/**
			 * START - SETUP USER WITH ONLY PASSWORD AUTHENTICATOR
			 */
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
			await page.goto('/signin?usePasscodeSignIn=true');
			await page.getByText('Sign in with a different email').click();

			await page.locator('input[name=email]').fill(emailAddress);

			const timeRequestWasMade3 = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const emailDetails3 = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade3,
			);

			// email
			expect(emailDetails3.body).toContain('Your verification code');
			expect(emailDetails3.codes?.length).toBe(1);
			const code3 = emailDetails3.codes?.[0].value;
			expect(code3).toMatch(/^\d{6}$/);

			// passcode page
			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill(code3!);

			await expect(page).toHaveURL(/welcome\/existing/);
		});
	});
});
