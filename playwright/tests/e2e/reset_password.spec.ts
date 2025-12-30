import { test, expect, Request } from '@playwright/test';
import {
	randomMailosaurEmail,
	randomPassword,
	createTestUser,
} from '../../helpers/api/idapi';
import { activateTestOktaUser } from '../../helpers/api/okta';
import { checkForEmailAndGetDetails } from '../../helpers/api/mailosaur';
import {
	getTestOktaUser,
	resetOktaUserPassword,
	expireOktaUserPassword,
} from '../../helpers/api/okta';

test.describe('Password reset recovery flows', () => {
	test.describe('Passcode limbo state - user does not set password after using passcode', () => {
		test('allows the user to recover from the STAGED state when going through reset password flow', async ({
			page,
		}) => {
			const emailAddress = randomMailosaurEmail();
			await page.goto(`/register/email?useSetPassword=true`);

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
			// recover by going through reset password flow
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

			// password page
			await expect(page).toHaveURL(/\/reset-password\/password/);

			await page.locator('input[name="password"]').fill(randomPassword());
			await page.locator('button[type="submit"]').click();

			// password complete page
			await expect(page).toHaveURL(/\/reset-password\/complete/);

			await expect(page.getByText('Password updated')).toBeVisible();
		});

		test('allows the user to recover from the PROVISIONED state when going through reset password flow', async ({
			request,
			page,
		}) => {
			const emailAddress = randomMailosaurEmail();
			await page.goto(`/register/email?useSetPassword=true`);

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
			// recover by going through reset password flow
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

test.describe('Password reset flow in Okta - useOktaClassic', () => {
	test.describe('Account exists', () => {
		test("changes the reader's password", async ({ request, page }) => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';
			const clientId = 'jobs';

			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto(
				`/reset-password?useOktaClassic=true&returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}`,
			);
			const timeRequestWasMade = new Date();

			await expect(page.getByText('Reset password')).toBeVisible();
			await page.locator('input[name=email]').fill(emailAddress);

			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page.getByText('Check your inbox')).toBeVisible();

			const { token } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/reset-password\/([^"]*)/,
			);

			await page.goto(`/reset-password/${token}`);

			const formAction = await page.locator('form').getAttribute('action');
			expect(formAction).toMatch(new RegExp(encodedReturnUrl));
			expect(formAction).toMatch(new RegExp(refViewId));
			expect(formAction).toMatch(new RegExp(encodedRef));
			expect(formAction).toMatch(new RegExp(clientId));

			// reload to make sure the params are persisted even on page refresh
			await page.reload();

			const breachCheckPromise = page.waitForRequest((req) =>
				req.url().includes('api.pwnedpasswords.com/range/'),
			);

			await page.locator('input[name=password]').fill(randomPassword());

			await breachCheckPromise;
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page.getByText('Password updated')).toBeVisible();
			await expect(page.getByText(emailAddress.toLowerCase())).toBeVisible();

			await expect(page).toHaveURL(new RegExp(encodedReturnUrl));
			await expect(page).toHaveURL(new RegExp(refViewId));
			await expect(page).toHaveURL(new RegExp(encodedRef));
			await expect(page).toHaveURL(new RegExp(clientId));
			await expect(page).not.toHaveURL(/useOkta=true/);
		});

		test("changes the reader's password, and has a prefixed recovery token when using a native app", async ({
			request,
			page,
		}) => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';
			const clientId = 'jobs';

			const appClientId = process.env.CYPRESS_OKTA_ANDROID_CLIENT_ID;
			const fromURI = 'fromURI1';

			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto(
				`/reset-password?useOktaClassic=true&returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}&appClientId=${appClientId}&fromURI=${fromURI}`,
			);
			const timeRequestWasMade = new Date();

			await expect(page.getByText('Reset password')).toBeVisible();
			await page.locator('input[name=email]').fill(emailAddress);

			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page.getByText('Check your inbox')).toBeVisible();

			const { token } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/reset-password\/([^"]*)/,
			);

			expect(token).toContain('al_');
			await page.goto(`/reset-password/${token}`);

			const formAction = await page.locator('form').getAttribute('action');
			expect(formAction).toMatch(new RegExp(encodedReturnUrl));
			expect(formAction).toMatch(new RegExp(refViewId));
			expect(formAction).toMatch(new RegExp(encodedRef));
			expect(formAction).toMatch(new RegExp(clientId));
			expect(formAction).not.toMatch(new RegExp(appClientId!));
			expect(formAction).not.toMatch(new RegExp(fromURI));

			// reload to make sure the params are persisted even on page refresh
			await page.reload();

			const breachCheckPromise = page.waitForRequest((req: Request) =>
				req.url().includes('api.pwnedpasswords.com/range/'),
			);

			await page.locator('input[name=password]').fill(randomPassword());

			await breachCheckPromise;
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page.getByText('Password updated')).toBeVisible();
			await expect(page.getByText(emailAddress.toLowerCase())).toBeVisible();

			await expect(page).toHaveURL(new RegExp(encodedReturnUrl));
			await expect(page).toHaveURL(new RegExp(refViewId));
			await expect(page).toHaveURL(new RegExp(encodedRef));
			await expect(page).toHaveURL(new RegExp(clientId));
			await expect(page).not.toHaveURL(/useOkta=true/);
			await expect(page).not.toHaveURL(new RegExp(appClientId!));
			await expect(page).not.toHaveURL(new RegExp(fromURI));
		});

		test("changes the reader's password and overrides returnUrl from encryptedStateCookie if one set on reset password page url", async ({
			request,
			page,
		}) => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';

			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto(
				`/reset-password?useOktaClassic=true&returnUrl=${encodedReturnUrl}`,
			);
			const timeRequestWasMade = new Date();

			await expect(page.getByText('Reset password')).toBeVisible();
			await page.locator('input[name=email]').fill(emailAddress);

			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page.getByText('Check your inbox')).toBeVisible();

			const { token } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/reset-password\/([^"]*)/,
			);

			const newReturnUrl = encodeURIComponent(
				'https://www.theguardian.com/technology/2017/may/04/nier-automata-sci-fi-game-sleeper-hit-designer-yoko-taro',
			);
			await page.goto(`/reset-password/${token}&returnUrl=${newReturnUrl}`);

			await expect(page).toHaveURL(new RegExp(newReturnUrl));
			await expect(page).not.toHaveURL(new RegExp(encodedReturnUrl));

			const formAction = await page.locator('form').getAttribute('action');
			expect(formAction).toContain(newReturnUrl);
			expect(formAction).not.toContain(encodedReturnUrl);

			// reload to make sure the params are persisted even on page refresh
			await page.reload();

			const breachCheckPromise = page.waitForRequest((req) =>
				req.url().includes('api.pwnedpasswords.com/range/'),
			);

			await page.locator('input[name=password]').fill(randomPassword());

			await breachCheckPromise;
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page.getByText('Password updated')).toBeVisible();
			await expect(page.getByText(emailAddress.toLowerCase())).toBeVisible();

			await expect(page).toHaveURL(new RegExp(newReturnUrl));
			await expect(page).not.toHaveURL(new RegExp(encodedReturnUrl));
			await expect(page).not.toHaveURL(/useOkta=true/);
		});

		test('overrides appClientId and fromURI if set on reset password page url', async ({
			request,
			page,
		}) => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';

			const appClientId1 = 'appClientId1';
			const fromURI1 = '/oauth2/v1/authorize';

			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto(
				`/reset-password?useOktaClassic=true&returnUrl=${encodedReturnUrl}&appClientId=${appClientId1}&fromURI=${fromURI1}`,
			);
			const timeRequestWasMade = new Date();

			await expect(page.getByText('Reset password')).toBeVisible();
			await page.locator('input[name=email]').fill(emailAddress);

			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page.getByText('Check your inbox')).toBeVisible();

			const { token } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/reset-password\/([^"]*)/,
			);

			const appClientId2 = 'appClientId2';
			const fromURI2 = '/oauth2/v2/authorize';
			await page.goto(
				`/reset-password/${token}&appClientId=${appClientId2}&fromURI=${fromURI2}`,
			);

			await expect(page).toHaveURL(new RegExp(appClientId2));
			await expect(page).toHaveURL(new RegExp(fromURI2));
			await expect(page).not.toHaveURL(new RegExp(appClientId1));
			await expect(page).not.toHaveURL(new RegExp(fromURI1));

			const formAction = await page.locator('form').getAttribute('action');
			expect(formAction).toMatch(new RegExp(appClientId2));
			expect(formAction).toMatch(new RegExp(encodeURIComponent(fromURI2)));
			expect(formAction).not.toMatch(new RegExp(appClientId1));
			expect(formAction).not.toMatch(new RegExp(encodeURIComponent(fromURI1)));
		});
	});

	test.describe('STAGED user', () => {
		test("changes the reader's password", async ({ request, page }) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: true,
			});

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe('STAGED');

			await page.goto('/reset-password?useOktaClassic=true');
			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('button[type="submit"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/\/set-password\/([^"]*)/,
			);

			expect(body).toContain('Welcome back');
			expect(body).toContain('Create password');
			expect(links.length).toBe(2);
			const setPasswordLink = links.find((link) =>
				link.text?.includes('Create password'),
			);
			expect(setPasswordLink?.href ?? '').not.toContain('useOkta=true');

			await page.goto(setPasswordLink?.href as string);
			await expect(page.getByText('Create password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();

			const breachCheckPromise = page.waitForRequest((req) =>
				req.url().includes('api.pwnedpasswords.com/range/'),
			);

			await page.locator('input[name=password]').fill(randomPassword());

			await breachCheckPromise;
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page.getByText('Password created')).toBeVisible();
			await expect(page.getByText(emailAddress.toLowerCase())).toBeVisible();
		});

		test("changes the reader's password, and has a prefixed recovery token when using a native app", async ({
			request,
			page,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: true,
			});

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe('STAGED');

			const appClientId = process.env.CYPRESS_OKTA_ANDROID_CLIENT_ID;
			const fromURI = 'fromURI1';

			await page.goto(
				`/reset-password?useOktaClassic=true&appClientId=${appClientId}&fromURI=${fromURI}`,
			);
			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('button[type="submit"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/\/set-password\/([^"]*)/,
			);

			expect(body).toContain('Welcome back');
			expect(body).toContain('Create password');
			expect(links.length).toBe(2);
			const setPasswordLink = links.find((link) =>
				link.text?.includes('Create password'),
			);
			expect(setPasswordLink?.href ?? '').toContain('al_');
			expect(setPasswordLink?.href ?? '').not.toContain('useOkta=true');

			await page.goto(setPasswordLink?.href as string);
			await expect(page.getByText('Create password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();

			const breachCheckPromise = page.waitForRequest((req) =>
				req.url().includes('api.pwnedpasswords.com/range/'),
			);

			await page.locator('input[name=password]').fill(randomPassword());

			await breachCheckPromise;
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page.getByText('Password created')).toBeVisible();
			await expect(page.getByText(emailAddress.toLowerCase())).toBeVisible();
		});
	});

	test.describe('PROVISIONED user', () => {
		test("changes the reader's password", async ({ request, page }) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: true,
			});

			await activateTestOktaUser(request, emailAddress);

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe('PROVISIONED');

			await page.goto('/reset-password?useOktaClassic=true');
			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('button[type="submit"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/\/set-password\/([^"]*)/,
			);

			expect(body).toContain('Welcome back');
			expect(body).toContain('Create password');
			expect(links.length).toBe(2);
			const setPasswordLink = links.find((link) =>
				link.text?.includes('Create password'),
			);
			expect(setPasswordLink?.href ?? '').not.toContain('useOkta=true');

			await page.goto(setPasswordLink?.href as string);
			await expect(page.getByText('Create password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();

			const breachCheckPromise = page.waitForRequest((req) =>
				req.url().includes('api.pwnedpasswords.com/range/'),
			);

			await page.locator('input[name=password]').fill(randomPassword());

			await breachCheckPromise;
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page.getByText('Password created')).toBeVisible();
			await expect(page.getByText(emailAddress.toLowerCase())).toBeVisible();
		});
	});

	test.describe('RECOVERY user', () => {
		test("changes the reader's password", async ({ request, page }) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: false,
			});

			await resetOktaUserPassword(request, emailAddress);

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe('RECOVERY');

			await page.goto('/reset-password?useOktaClassic=true');
			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('button[type="submit"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/reset-password\/([^"]*)/,
			);

			expect(body).toContain('Password reset');
			expect(body).toContain('Reset password');
			expect(links.length).toBe(3);
			const resetPasswordLink = links.find((link) =>
				link.text?.includes('Reset password'),
			);
			expect(resetPasswordLink?.href ?? '').not.toContain('useOkta=true');

			await page.goto(resetPasswordLink?.href as string);
			await expect(page.getByText('Create new password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();

			const breachCheckPromise = page.waitForRequest((req) =>
				req.url().includes('api.pwnedpasswords.com/range/'),
			);

			await page.locator('input[name=password]').fill(randomPassword());

			await breachCheckPromise;
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page.getByText('Password updated')).toBeVisible();
			await expect(page.getByText(emailAddress.toLowerCase())).toBeVisible();
		});
	});

	test.describe('PASSWORD_EXPIRED user', () => {
		test('changes the readers password', async ({ request, page }) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: false,
			});

			await expireOktaUserPassword(request, emailAddress);

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe('PASSWORD_EXPIRED');

			await page.goto('/reset-password?useOktaClassic=true');
			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('button[type="submit"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/reset-password\/([^"]*)/,
			);

			expect(body).toContain('Password reset');
			expect(body).toContain('Reset password');
			expect(links.length).toBe(3);
			const resetPasswordLink = links.find((link) =>
				link.text?.includes('Reset password'),
			);
			expect(resetPasswordLink?.href ?? '').not.toContain('useOkta=true');

			await page.goto(resetPasswordLink?.href as string);
			await expect(page.getByText('Create new password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();

			const breachCheckPromise = page.waitForRequest((req) =>
				req.url().includes('api.pwnedpasswords.com/range/'),
			);

			await page.locator('input[name=password]').fill(randomPassword());

			await breachCheckPromise;
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page.getByText('Password updated')).toBeVisible();
			await expect(page.getByText(emailAddress.toLowerCase())).toBeVisible();
		});
	});

	// verify-email is just a reskinned reset password page
	test.describe('/verify-email page', () => {
		test('redirects to /verify-email if a token is in the URL', async ({
			page,
		}) => {
			await page.goto('/verify-email/123');
			await expect(page).toHaveURL(/\/verify-email/);
		});

		test('shows the reset password success page when the form is submitted', async ({
			page,
		}) => {
			await page.goto('/verify-email');
			await expect(
				page.getByRole('heading', { name: 'Verify your email' }),
			).toBeVisible();
			await expect(
				page.getByText(
					'As a security measure, to verify your email, you will need to reset your password.',
				),
			).toBeVisible();
			await page.locator('input[name=email]').fill('test@email.com');
			await page.locator('button[type="submit"]').click();
			await expect(page.getByText('Enter your one-time code')).toBeVisible();
		});
	});
});
