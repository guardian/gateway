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
	activateTestOktaUser,
} from '../../helpers/api/okta';

test.describe('Password reset recovery flows - with Passcodes', () => {
	test.describe('ACTIVE user with password', () => {
		test('allows the user to change their password', async ({
			request,
			page,
		}) => {
			const encodedReturnUrl = encodeURIComponent(
				'https://www.theguardian.com/technology/2017/may/04/nier-automata-sci-fi-game-sleeper-hit-designer-yoko-taro',
			);
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';
			const clientId = 'jobs';

			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto(
				`/reset-password?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}`,
			);
			const timeRequestWasMade = new Date();

			await expect(page.getByText('Reset password')).toBeVisible();
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
			const formAction = await page.locator('form').getAttribute('action');
			expect(formAction).toMatch(new RegExp(encodedReturnUrl));
			expect(formAction).toMatch(new RegExp(refViewId));
			expect(formAction).toMatch(new RegExp(encodedRef));
			expect(formAction).toMatch(new RegExp(clientId));

			await expect(page.getByText('Submit one-time code')).toBeVisible();

			await page.locator('input[name=code]').fill(code!);

			// password page
			await expect(page).toHaveURL(/\/reset-password\/password/);
			const formAction2 = await page.locator('form').getAttribute('action');
			expect(formAction2).toMatch(new RegExp(encodedReturnUrl));
			expect(formAction2).toMatch(new RegExp(refViewId));
			expect(formAction2).toMatch(new RegExp(encodedRef));
			expect(formAction2).toMatch(new RegExp(clientId));

			await page.locator('input[name="password"]').fill(randomPassword());
			await page.locator('button[type="submit"]').click();

			// password complete page
			await expect(page).toHaveURL(/\/reset-password\/complete/);
			await expect(page).toHaveURL(new RegExp(encodedReturnUrl));
			await expect(page).toHaveURL(new RegExp(refViewId));
			await expect(page).toHaveURL(new RegExp(encodedRef));
			await expect(page).toHaveURL(new RegExp(clientId));

			await expect(page.getByText('Password updated')).toBeVisible();
			const continueLink = page.getByRole('link', {
				name: 'Continue to the Guardian',
			});
			await expect(continueLink).toHaveAttribute(
				'href',
				decodeURIComponent(encodedReturnUrl),
			);
		});

		test('allows the user to change their password - with fromUri', async ({
			request,
			page,
		}) => {
			const encodedReturnUrl = encodeURIComponent(
				'https://www.theguardian.com/technology/2017/may/04/nier-automata-sci-fi-game-sleeper-hit-designer-yoko-taro',
			);
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';
			const clientId = 'jobs';

			const appClientId = 'appClientId1';
			const fromURI = '/oauth2/v1/authorize';

			// Intercept the external redirect page.
			await page.route(
				`https://${process.env.BASE_URI}${decodeURIComponent(fromURI)}`,
				async (route) => {
					await route.fulfill({ status: 200 });
				},
			);

			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto(
				`/reset-password?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}&appClientId=${appClientId}&fromURI=${fromURI}`,
			);
			const timeRequestWasMade = new Date();

			await expect(page.getByText('Reset password')).toBeVisible();
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
			const formAction = await page.locator('form').getAttribute('action');
			expect(formAction).toMatch(new RegExp(encodedReturnUrl));
			expect(formAction).toMatch(new RegExp(refViewId));
			expect(formAction).toMatch(new RegExp(encodedRef));
			expect(formAction).toMatch(new RegExp(clientId));
			expect(formAction).toMatch(new RegExp(appClientId));
			expect(formAction).toMatch(new RegExp(encodeURIComponent(fromURI)));

			await expect(page.getByText('Submit one-time code')).toBeVisible();

			await page.locator('input[name=code]').fill(code!);

			// password page
			await expect(page).toHaveURL(/\/reset-password\/password/);
			const formAction2 = await page.locator('form').getAttribute('action');
			expect(formAction2).toMatch(new RegExp(encodedReturnUrl));
			expect(formAction2).toMatch(new RegExp(refViewId));
			expect(formAction2).toMatch(new RegExp(encodedRef));
			expect(formAction2).toMatch(new RegExp(clientId));
			expect(formAction2).toMatch(new RegExp(appClientId));
			expect(formAction2).toMatch(new RegExp(encodeURIComponent(fromURI)));

			await page.locator('input[name="password"]').fill(randomPassword());
			await page.locator('button[type="submit"]').click();

			// fromURI redirect
			await expect(page).toHaveURL(new RegExp(decodeURIComponent(fromURI)));
		});

		test('passcode incorrect functionality', async ({ request, page }) => {
			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto(`/reset-password`);

			const timeRequestWasMade = new Date();
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

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

			await page.locator('input[name=code]').fill(`${+code! + 1}`);

			await expect(page).toHaveURL(/\/reset-password\/code/, {
				timeout: 30000,
			});

			await expect(page.getByText('Incorrect code')).toBeVisible();

			await page.locator('input[name=code]').clear();
			await page.locator('input[name=code]').fill(code!);
			await page.getByText('Submit one-time code').click();

			await expect(page).toHaveURL(/\/reset-password\/password/);

			await page.locator('input[name="password"]').fill(randomPassword());
			await page.locator('button[type="submit"]').click();

			await expect(page).toHaveURL(/\/reset-password\/complete/);
		});

		test('passcode used functionality', async ({ request, page }) => {
			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto(`/reset-password`);

			const timeRequestWasMade = new Date();
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

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

			await expect(page).toHaveURL(/\/reset-password\/password/);

			await page.goBack();
			await expect(page).toHaveURL(/\/reset-password\/email-sent/);
			await expect(page.getByText('Passcode verified')).toBeVisible();
			await page.getByText('Complete setting password').click();

			await expect(page).toHaveURL(/\/reset-password\/password/);

			await page.locator('input[name="password"]').fill(randomPassword());
			await page.locator('button[type="submit"]').click();

			await expect(page).toHaveURL(/\/reset-password\/complete/);
		});

		test('resend email functionality', async ({ request, page }) => {
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
			await page.goto(`/reset-password`);

			const timeRequestWasMade = new Date();
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

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

			// resend email
			const timeRequestWasMade2 = new Date();
			await page.waitForTimeout(1000); // wait for the send again button to be enabled
			await page.getByText('send again').click();

			const emailDetails2 = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade2,
			);

			// email
			expect(emailDetails2.body).toContain('Your one-time passcode');
			expect(emailDetails2.codes?.length).toBe(1);
			const code2 = emailDetails2.codes?.[0].value;
			expect(code2).toMatch(/^\d{6}$/);

			// passcode page
			await expect(page).toHaveURL(/\/reset-password\/email-sent/);
			await expect(page.getByText('Enter your one-time code')).toBeVisible();

			await expect(page.getByText('Submit one-time code')).toBeVisible();
			await page.locator('input[name=code]').clear();
			await page.locator('input[name=code]').fill(code2!);

			await expect(page).toHaveURL(/\/reset-password\/password/);

			await page.locator('input[name="password"]').fill(randomPassword());
			await page.locator('button[type="submit"]').click();

			await expect(page).toHaveURL(/\/reset-password\/complete/);
		});

		test('change email functionality', async ({ request, page }) => {
			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto(`/reset-password`);

			const timeRequestWasMade = new Date();
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

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
			await page.getByText('try another address').click();

			await expect(page).toHaveURL(/\/reset-password/);
		});

		test('should redirect with error when multiple passcode attempts fail', async ({
			request,
			page,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto(`/reset-password`);

			const timeRequestWasMade = new Date();
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

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

			// attempt 1 - auto submit
			await expect(page.getByText('Submit one-time code')).toBeVisible();
			await page.locator('input[name=code]').fill(`${+code! + 1}`);
			await expect(page).toHaveURL(/\/reset-password\/code/);
			await expect(page.getByText('Incorrect code')).toBeVisible();

			// attempt 2 - manual submit
			await page.locator('input[name=code]').fill(`${+code! + 1}`);
			await page.getByText('Submit one-time code').click();
			await expect(page).toHaveURL(/\/reset-password\/code/);
			await expect(page.getByText('Incorrect code')).toBeVisible();

			// attempt 3 - manual submit
			await page.locator('input[name=code]').fill(`${+code! + 1}`);
			await page.getByText('Submit one-time code').click();
			await expect(page).toHaveURL(/\/reset-password\/code/);
			await expect(page.getByText('Incorrect code')).toBeVisible();

			// attempt 4 - manual submit
			await page.locator('input[name=code]').fill(`${+code! + 1}`);
			await page.getByText('Submit one-time code').click();
			await expect(page).toHaveURL(/\/reset-password\/code/);
			await expect(page.getByText('Incorrect code')).toBeVisible();

			// attempt 5 - manual submit
			await page.locator('input[name=code]').fill(`${+code! + 1}`);
			await page.getByText('Submit one-time code').click();
			await expect(page).toHaveURL(/\/reset-password/);
			await expect(page.getByText('Your code has expired')).toBeVisible();
		});

		test('ACTIVE user with only password authenticator - allow the user to change thier password and authenticate', async ({
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

			// make sure we don't use a passcode
			// we instead reset their password using to set a password
			await page.goto('/reset-password');

			const timeRequestWasMade2 = new Date();
			await page.locator('input[name=email]').clear();
			await page.locator('input[name=email]').fill(emailAddress);
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
	});

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
