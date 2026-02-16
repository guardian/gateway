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
	suspendOktaUser,
	getTestOktaUser,
} from '../../helpers/api/okta';

test.describe('Registration flow - Split 3/3', () => {
	// a few tests to check if the Okta Classic flow is still working using the useOktaClassic flag
	test.describe('Okta Classic Flow - new user', () => {
		test('create account - successfully registers using an email with no existing account', async ({
			page,
			request,
		}) => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';
			const clientId = 'jobs';

			// these params should *not* persist between initial registration and welcome page
			// despite the fact that they PersistableQueryParams, as these are set by the Okta SDK sign in method
			// and subsequent interception, and not by gateway
			const appClientId = 'appClientId1';
			const fromURI = 'fromURI1';

			await page.goto(
				`/register/email?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}&appClientId=${appClientId}&fromURI=${fromURI}&useOktaClassic=true`,
			);

			const timeRequestWasMade = new Date();
			await page.locator('input[name=email]').fill(unregisteredEmail);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(unregisteredEmail)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			const { body, token } = await checkForEmailAndGetDetails(
				unregisteredEmail,
				timeRequestWasMade,
				/welcome\/([^"]*)/,
			);

			expect(body).toContain('Complete registration');
			await page.goto(`/welcome/${token}`);
			await expect(page.getByText('Complete creating account')).toBeVisible();

			const form = page.locator('form');
			const formAction = await form.getAttribute('action');
			expect(formAction).toMatch(new RegExp(encodedReturnUrl));
			expect(formAction).toMatch(new RegExp(refViewId));
			expect(formAction).toMatch(new RegExp(encodedRef));
			expect(formAction).toMatch(new RegExp(clientId));
			expect(formAction).not.toMatch(new RegExp(appClientId));
			expect(formAction).not.toMatch(new RegExp(fromURI));

			// we are reloading here to make sure the params are persisted even on page refresh
			await page.reload();

			await page.locator('input[name="firstName"]').fill('First Name');
			await page.locator('input[name="secondName"]').fill('Last Name');
			await page.locator('input[name="password"]').fill(randomPassword());
			await page.locator('button[type="submit"]').click();

			await expect(page).toHaveURL(new RegExp(encodedReturnUrl));
			await expect(page).toHaveURL(new RegExp(refViewId));
			await expect(page).toHaveURL(new RegExp(encodedRef));
			await expect(page).toHaveURL(new RegExp(clientId));
			expect(page.url()).not.toMatch(new RegExp(appClientId));
			expect(page.url()).not.toMatch(new RegExp(fromURI));

			// test the registration platform is set correctly
			const oktaUser = await getTestOktaUser(request, unregisteredEmail);
			expect(oktaUser.status).toBe(Status.ACTIVE);
			expect(oktaUser.profile.registrationPlatform).toBe('profile');
		});

		test('create account - successfully registers using an email with no existing account, and has a prefixed activation token when using a native app', async ({
			page,
			request,
		}) => {
			await page.route('https://m.code.dev-theguardian.com/', async (route) => {
				await route.fulfill({ status: 200 });
			});

			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';
			const clientId = 'jobs';

			// these params should *not* persist between initial registration and welcome page
			// despite the fact that they PersistableQueryParams, as these are set by the Okta SDK sign in method
			// and subsequent interception, and not by gateway
			const appClientId = process.env.CYPRESS_OKTA_ANDROID_CLIENT_ID;
			const fromURI = 'fromURI1';

			await page.goto(
				`/register/email?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}&appClientId=${appClientId}&fromURI=${fromURI}&useOktaClassic=true`,
			);

			const timeRequestWasMade = new Date();
			await page.locator('input[name=email]').fill(unregisteredEmail);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(unregisteredEmail)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			const { body, token } = await checkForEmailAndGetDetails(
				unregisteredEmail,
				timeRequestWasMade,
				/welcome\/([^"]*)/,
			);

			expect(body).toContain('Complete registration');
			expect(token).toContain('al_');
			await page.goto(`/welcome/${token}`);
			await expect(page.getByText('Complete creating account')).toBeVisible();

			const form = page.locator('form');
			const formAction = await form.getAttribute('action');
			expect(formAction).toMatch(new RegExp(encodedReturnUrl));
			expect(formAction).toMatch(new RegExp(refViewId));
			expect(formAction).toMatch(new RegExp(encodedRef));
			expect(formAction).toMatch(new RegExp(clientId));
			expect(formAction).not.toMatch(new RegExp(appClientId!));
			expect(formAction).not.toMatch(new RegExp(fromURI));

			// we are reloading here to make sure the params are persisted even on page refresh
			await page.reload();

			const formAfterReload = page.locator('form');
			const formActionAfterReload =
				await formAfterReload.getAttribute('action');
			expect(formActionAfterReload).toMatch(new RegExp(encodedReturnUrl));
			expect(formActionAfterReload).toMatch(new RegExp(refViewId));
			expect(formActionAfterReload).toMatch(new RegExp(encodedRef));
			expect(formActionAfterReload).toMatch(new RegExp(clientId));
			expect(formActionAfterReload).not.toMatch(new RegExp(appClientId!));
			expect(formActionAfterReload).not.toMatch(new RegExp(fromURI));

			await page.locator('input[name="firstName"]').fill('First Name');
			await page.locator('input[name="secondName"]').fill('Last Name');
			await page.locator('input[name="password"]').fill(randomPassword());
			await page.locator('button[type="submit"]').click();

			await expect(page).toHaveURL(/\/welcome\/al_\/complete/);
			await expect(page.getByText(unregisteredEmail)).toBeVisible();
			await expect(page.getByText('Guardian app')).toBeVisible();

			// test the registration platform is set correctly
			const oktaUser = await getTestOktaUser(request, unregisteredEmail);
			expect(oktaUser.status).toBe(Status.ACTIVE);
			expect(oktaUser.profile.registrationPlatform).toBe('android_live_app');
		});

		test('welcome expired - send an email for user with no existing account', async ({
			page,
		}) => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();

			await page.goto(
				`/welcome/resend?returnUrl=${encodedReturnUrl}&useOktaClassic=true`,
			);

			const timeRequestWasMade = new Date();
			await page.locator('input[name=email]').fill(unregisteredEmail);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(unregisteredEmail)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			const { body, token } = await checkForEmailAndGetDetails(
				unregisteredEmail,
				timeRequestWasMade,
				/welcome\/([^"]*)/,
			);

			expect(body).toContain('Complete registration');
			await page.goto(`/welcome/${token}`);
			await expect(page.getByText('Complete creating account')).toBeVisible();

			const form = page.locator('form');
			const formAction = await form.getAttribute('action');
			expect(formAction).toMatch(new RegExp(encodedReturnUrl));

			// we are reloading here to make sure the params are persisted even on page refresh
			await page.reload();

			await page.locator('input[name="password"]').fill(randomPassword());
			await page.locator('button[type="submit"]').click();
			await expect(page).toHaveURL(new RegExp(encodedReturnUrl));
		});
	});

	test.describe('Existing users attempting to register with Okta - useOktaClassic', () => {
		test('should send a STAGED user a set password email with an Okta activation token', async ({
			page,
			request,
		}) => {
			// Test users created via IDAPI-with-Okta do not have the activation
			// lifecycle run at creation, so they don't transition immediately from
			// STAGED to PROVISIONED (c.f.
			// https://developer.okta.com/docs/reference/api/users/#create-user) .
			// This is useful for us as we can test STAGED users first, then test
			// PROVISIONED users in the next test by activating a STAGED user. Users
			// created through Gateway-with-Okta do have this lifecycle run, so if we
			// rebuild these tests to not use IDAPI at all, we need to figure out a
			// way to test STAGED and PROVISIONED users (probably by just passing an
			// optional `activate` prop to a createUser function).
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

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/\/set-password\/([^"]*)/,
			);

			expect(body).toContain('This account already exists');
			expect(body).toContain('Create password');
			expect(links.length).toBe(2);
			const setPasswordLink = links.find((s) =>
				s.text?.includes('Create password'),
			);
			expect(setPasswordLink?.href).not.toContain('useOkta=true');
			await page.goto(setPasswordLink?.href as string);
			await expect(page.getByText('Create password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
		});

		test('should send a STAGED user a set password email with an Okta activation token, and has a prefixed activation token when using a native app', async ({
			page,
			request,
		}) => {
			// Test users created via IDAPI-with-Okta do not have the activation
			// lifecycle run at creation, so they don't transition immediately from
			// STAGED to PROVISIONED (c.f.
			// https://developer.okta.com/docs/reference/api/users/#create-user) .
			// This is useful for us as we can test STAGED users first, then test
			// PROVISIONED users in the next test by activating a STAGED user. Users
			// created through Gateway-with-Okta do have this lifecycle run, so if we
			// rebuild these tests to not use IDAPI at all, we need to figure out a
			// way to test STAGED and PROVISIONED users (probably by just passing an
			// optional `activate` prop to a createUser function).
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: true,
				isUserEmailValidated: true,
			});

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.STAGED);

			const appClientId = process.env.CYPRESS_OKTA_ANDROID_CLIENT_ID;
			const fromURI = 'fromURI1';

			await page.goto(
				`/register/email?appClientId=${appClientId}&fromURI=${fromURI}&useOktaClassic=true`,
			);
			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/\/set-password\/([^"]*)/,
			);

			expect(body).toContain('This account already exists');
			expect(body).toContain('Create password');
			expect(links.length).toBe(2);
			const setPasswordLink = links.find((s) =>
				s.text?.includes('Create password'),
			);
			expect(setPasswordLink?.href ?? '').toContain('al_');
			expect(setPasswordLink?.href ?? '').not.toContain('useOkta=true');
			await page.goto(setPasswordLink?.href as string);
			await expect(page.getByText('Create password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
		});

		test('should send a PROVISIONED user a set password email with an Okta activation token', async ({
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

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/\/set-password\/([^"]*)/,
			);

			expect(body).toContain('This account already exists');
			expect(body).toContain('Create password');
			expect(links.length).toBe(2);
			const setPasswordLink = links.find((s) =>
				s.text?.includes('Create password'),
			);
			expect(setPasswordLink?.href).not.toContain('useOkta=true');
			await page.goto(setPasswordLink?.href as string);
			await expect(page.getByText('Create password')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
		});

		test('should send an ACTIVE UNvalidated user with a password a security email with activation token', async ({
			page,
			request,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: false,
				isUserEmailValidated: false,
			});

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.ACTIVE);

			await page.goto('/register/email?useOktaClassic=true');
			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			// Make sure that we don't get sent to the 'security reasons' page
			await expect(page).toHaveURL(/\/passcode/);
			await expect(
				page.getByText(
					'For security reasons we need you to change your password.',
				),
			).not.toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/reset-password\/([^"]*)/,
			);

			expect(body).toContain(
				'Because your security is extremely important to us, we have changed our password policy.',
			);
			expect(body).toContain('Reset password');
			expect(links.length).toBe(2);
			const resetPasswordLink = links.find((s) =>
				s.text?.includes('Reset password'),
			);
			await page.goto(resetPasswordLink?.href as string);
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('Create new password')).toBeVisible();
		});

		test('should send an ACTIVE validated user WITH a password a reset password email with an activation token', async ({
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

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
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
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('Create new password')).toBeVisible();
		});

		test('should send an ACTIVE validated user WITH a password a reset password email with an activation token, and prefixed activation token if using native app', async ({
			page,
			request,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: false,
				isUserEmailValidated: true,
			});

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.ACTIVE);

			const appClientId = process.env.CYPRESS_OKTA_ANDROID_CLIENT_ID;
			const fromURI = 'fromURI1';

			await page.goto(
				`/register/email?appClientId=${appClientId}&fromURI=${fromURI}&useOktaClassic=true`,
			);
			const timeRequestWasMade = new Date();

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Check your inbox')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
				/reset-password\/([^"]*)/,
			);

			expect(body).toContain('This account already exists');
			expect(body).toContain('Sign in');
			expect(body).toContain('Reset password');
			expect(links.length).toBe(3);
			const resetPasswordLink = links.find((s) =>
				s.text?.includes('Reset password'),
			);
			expect(resetPasswordLink?.href ?? '').toContain('al_');
			expect(resetPasswordLink?.href ?? '').not.toContain('useOkta=true');
			await page.goto(resetPasswordLink?.href as string);
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('Create new password')).toBeVisible();
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

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
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

			const { links, body } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade,
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

		test('should display an error if a SUSPENDED user attempts to register', async ({
			page,
			request,
		}) => {
			const { emailAddress } = await createTestUser(request, {
				isGuestUser: false,
				isUserEmailValidated: true,
			});

			await suspendOktaUser(request, emailAddress);

			const oktaUser = await getTestOktaUser(request, emailAddress);
			expect(oktaUser.status).toBe(Status.SUSPENDED);

			await page.goto('/register/email?useOktaClassic=true');

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(
				page.getByText('There was a problem registering, please try again.'),
			).toBeVisible();
		});
	});

	test.describe('Extra checks', () => {
		test('should navigate back to the correct page when change email is clicked', async ({
			page,
		}) => {
			await page.goto('/register/email-sent');
			await page.getByText('try another address').click();
			await expect(page.getByText('Create your account')).toBeVisible();
			await expect(page).toHaveTitle('Register With Email | The Guardian');
		});

		test('should render properly if the encrypted email cookie is not set', async ({
			page,
		}) => {
			await page.goto('/register/email-sent');
			await expect(page.getByText('try another address')).toBeVisible();
			await expect(page.getByText('Check your inbox')).toBeVisible();
		});

		test('shows reCAPTCHA errors when the request fails', async ({
			page,
			request,
		}) => {
			// mechanism to block POST requests to recaptcha
			let blockRecaptcha = false;
			await page.route(/.*google\.com\/recaptcha\/api2\/.*/, async (route) => {
				if (blockRecaptcha && route.request().method() === 'POST') {
					await route.fulfill({ status: 500 });
				} else {
					await route.continue();
				}
			});

			await page.context().addCookies([
				{
					name: 'cypress-mock-state',
					value: '1',
					domain: process.env.BASE_URI,
					path: '/',
				},
			]);

			const { emailAddress } = await createTestUser(request, {
				isUserEmailValidated: false,
			});

			await page.goto('/register/email');
			await page.locator('input[name=email]').fill(emailAddress);

			const timeRequestWasMadeInitialEmail = new Date();

			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMadeInitialEmail,
			);

			blockRecaptcha = true;

			await page.waitForTimeout(1000); // wait for the send again button to be enabled
			await page.getByText('send again').click();
			await expect(
				page.getByText('Google reCAPTCHA verification failed.'),
			).toBeVisible();
			await expect(
				page.getByText('If the problem persists please try the following:'),
			).toBeVisible();

			const timeRequestWasMade = new Date();
			await page.waitForTimeout(1000); // wait for the send again button to be enabled

			blockRecaptcha = false;

			await page.getByText('send again').click();

			await expect(
				page.getByText('Google reCAPTCHA verification failed.'),
			).not.toBeVisible();

			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();

			await checkForEmailAndGetDetails(emailAddress, timeRequestWasMade);
		});

		test('persists the clientId when navigating away', async ({ page }) => {
			await page.goto('/register?clientId=jobs');
			await page.getByText('Sign in').click();
			await expect(page).toHaveURL(/clientId=jobs/);
		});

		test('does not proceed when no email provided', async ({ page }) => {
			await page.goto('/register/email');
			await page.locator('[data-cy="main-form-submit-button"]').click();
			// check that form isn't submitted
			expect(page.url()).not.toContain('returnUrl');
			await expect(page.getByText('Please enter your email.')).toBeVisible();
		});

		test('does not proceed when invalid email provided', async ({ page }) => {
			await page.goto('/register/email');
			const invalidEmail = 'invalid.email.com';
			await page.locator('input[name=email]').fill(invalidEmail);
			await page.locator('[data-cy="main-form-submit-button"]').click();
			// check that form isn't submitted
			expect(page.url()).not.toContain('returnUrl');
			await expect(
				page.getByText('Please enter a valid email format.'),
			).toBeVisible();
		});

		test('Continue with Google button links to /signin/google', async ({
			page,
		}) => {
			await page.goto('/register');
			const googleButton = page.getByText('Continue with Google');
			await expect(googleButton).toHaveAttribute('href', /\/signin\/google/);
		});

		test('Continue with Apple button links to /signin/apple', async ({
			page,
		}) => {
			await page.goto('/register');
			const appleButton = page.getByText('Continue with Apple');
			await expect(appleButton).toHaveAttribute('href', /\/signin\/apple/);
		});

		test('Continue with Email button links to /register/email', async ({
			page,
		}) => {
			await page.goto('/register');
			const emailButton = page.getByText('Continue with email');
			await expect(emailButton).toHaveAttribute('href', /\/register\/email/);
		});
	});

	test.describe('Terms and Conditions links', () => {
		test('links to the Google terms of service page', async ({ page }) => {
			const googleTermsUrl = 'https://policies.google.com/terms';
			// Intercept the external redirect page.
			await page.route(googleTermsUrl, async (route) => {
				await route.fulfill({ status: 200 });
			});
			await page.goto('/register/email');
			await page.getByText('terms of service').click();
			await expect(page).toHaveURL(googleTermsUrl);
		});

		test('links to the Google privacy policy page', async ({ page }) => {
			const googlePrivacyPolicyUrl = 'https://policies.google.com/privacy';
			// Intercept the external redirect page.
			await page.route(googlePrivacyPolicyUrl, async (route) => {
				await route.fulfill({ status: 200 });
			});
			await page.goto('/register/email');
			await page
				.getByText('This service is protected by reCAPTCHA and the Google')
				.getByText('privacy policy')
				.click();
			await expect(page).toHaveURL(googlePrivacyPolicyUrl);
		});

		test('links to the Guardian terms and conditions page', async ({
			page,
		}) => {
			const guardianTermsOfServiceUrl =
				'https://www.theguardian.com/help/terms-of-service';
			// Intercept the external redirect page.
			await page.route(guardianTermsOfServiceUrl, async (route) => {
				await route.fulfill({ status: 200 });
			});
			await page.goto('/register');
			await page.getByText('terms and conditions').click();
			await expect(page).toHaveURL(guardianTermsOfServiceUrl);
		});

		test('links to the Guardian privacy policy page', async ({ page }) => {
			const guardianPrivacyPolicyUrl =
				'https://www.theguardian.com/help/privacy-policy';
			// Intercept the external redirect page.
			await page.route(guardianPrivacyPolicyUrl, async (route) => {
				await route.fulfill({ status: 200 });
			});
			await page.goto('/register');
			await page
				.getByText(
					'For more information about how we use your data, including the generation of random identifiers',
				)
				.getByText('privacy policy')
				.click();
			await expect(page).toHaveURL(guardianPrivacyPolicyUrl);
		});
	});

	test('persists the clientId when navigating away', async ({ page }) => {
		await page.goto('/register?clientId=jobs');
		await page.getByText('Sign in').click();
		await expect(page).toHaveURL(/clientId=jobs/);
	});

	test('does not proceed when no email provided', async ({ page }) => {
		await page.goto('/register/email');
		await page.locator('[data-cy="main-form-submit-button"]').click();
		// check that form isn't submitted
		expect(page.url()).not.toContain('returnUrl');
		await expect(page.getByText('Please enter your email.')).toBeVisible();
	});
});
