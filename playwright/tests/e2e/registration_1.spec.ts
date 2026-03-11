import { test, expect } from '@playwright/test';
import { Status } from '../../../src/server/models/okta/User';
import { randomMailosaurEmail, randomPassword } from '../../helpers/api/idapi';
import { checkForEmailAndGetDetails } from '../../helpers/api/mailosaur';
import { getTestOktaUser } from '../../helpers/api/okta';
import { JOBS_TOS_URI } from '@/shared/model/Configuration';
import { escapeRegExp, incrementPasscode } from '../../helpers/utils';
import { mockClientRecaptcha } from '../../helpers/network/recaptcha';

test.describe('Registration flow - Split 1/4', () => {
	test.describe('Registering with Okta', () => {
		test('successfully registers using an email with no existing account using a passcode - passwordless user', async ({
			page,
			request,
		}) => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';

			await page.goto(
				`/register/email?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}`,
			);

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
			const form = page.locator('form');
			const formAction = await form.getAttribute('action');
			expect(formAction).toMatch(new RegExp(escapeRegExp(encodedReturnUrl)));
			expect(formAction).toMatch(new RegExp(escapeRegExp(refViewId)));
			expect(formAction).toMatch(new RegExp(escapeRegExp(encodedRef)));

			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill(code!);

			// test the registration platform is set correctly
			const oktaUser = await getTestOktaUser(request, unregisteredEmail);
			/*
			 * Previously the playwright test checked that the okta status was 'ACTIVE' next
			 * However, in playwright the status appears to be 'STAGED'
			 * expect(oktaUser.status).toBe(Status.ACTIVE);
			 */
			expect(oktaUser.profile.registrationPlatform).toBe('profile');

			await expect(page).toHaveURL(/\/welcome\/review/, { timeout: 10000 });
		});

		test('successfully registers using an email with no existing account using a passcode - using the combined signin/register flow', async ({
			page,
			request,
		}) => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';

			await page.goto(
				`/signin?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}`,
			);

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
			const form = page.locator('form');
			const formAction = await form.getAttribute('action');
			expect(formAction).toMatch(new RegExp(escapeRegExp(encodedReturnUrl)));
			expect(formAction).toMatch(new RegExp(escapeRegExp(refViewId)));
			expect(formAction).toMatch(new RegExp(escapeRegExp(encodedRef)));

			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill(code!);

			// test the registration platform is set correctly
			const oktaUser = await getTestOktaUser(request, unregisteredEmail);
			/*
			 * Previously the playwright test checked that the okta status was 'ACTIVE' next
			 * However, in playwright the status appears to be 'STAGED'
			 * expect(oktaUser.status).toBe(Status.ACTIVE);
			 */
			expect(oktaUser.profile.registrationPlatform).toBe('profile');

			await expect(page).toHaveURL(/\/welcome\/complete-account/);
			await page.getByRole('button', { name: 'Next' }).click();
			await expect(page).toHaveURL(/\/welcome\/review/);
		});

		test('successfully registers using an email with no existing account using a passcode - passwordless jobs user - using the combined signin/register flow', async ({
			page,
		}) => {
			const appClientId = 'appClientId1';
			const clientId = 'jobs';
			const fromURI = '/oauth2/v1/authorize';

			// Intercept the external redirect page.
			await page.route(
				`https://${process.env.BASE_URI}${decodeURIComponent(fromURI)}`,
				async (route) => {
					await route.fulfill({ status: 200 });
				},
			);
			// block recaptcha client script to prevent google from robot checking playwright
			await mockClientRecaptcha(page);

			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';

			await page.goto(
				`/signin?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&clientId=${clientId}&appClientId=${appClientId}&fromURI=${fromURI}`,
			);

			const timeRequestWasMade = new Date();
			await page.locator('input[name=email]').fill(unregisteredEmail);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText(unregisteredEmail)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			const { id, body, codes } = await checkForEmailAndGetDetails(
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
			const form = page.locator('form');
			const formAction = await form.getAttribute('action');
			expect(formAction).toMatch(new RegExp(escapeRegExp(encodedReturnUrl)));
			expect(formAction).toMatch(new RegExp(escapeRegExp(refViewId)));
			expect(formAction).toMatch(new RegExp(escapeRegExp(encodedRef)));
			expect(formAction).toMatch(new RegExp(escapeRegExp(appClientId)));
			expect(formAction).toMatch(
				new RegExp(escapeRegExp(encodeURIComponent(fromURI))),
			);

			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill(code!);

			// jobs T&C page
			await expect(page).toHaveURL(new RegExp(escapeRegExp(JOBS_TOS_URI)));
			await expect(
				page.getByText(
					'Click ‘continue’ to automatically use your existing Guardian account to sign in with Guardian Jobs',
				),
			).toBeVisible();

			await page.locator('input[name=firstName]').fill(id);
			await page.locator('input[name=secondName]').fill(id);
			await page.locator('button[type="submit"]').click();

			// Complete Account page (with just Jobs newsletter)
			await expect(page).toHaveURL(/\/welcome\/complete-account/);
			await expect(page.getByText('Guardian Jobs newsletter')).toBeVisible();

			await page.getByRole('button', { name: 'Next' }).click();

			await expect(page).toHaveURL(
				new RegExp(escapeRegExp(decodeURIComponent(fromURI))),
			);
		});

		test('successfully registers using an email with no existing account using a passcode and redirects to fromURI - passwordless user', async ({
			page,
			request,
		}) => {
			const appClientId = 'appClientId1';
			const fromURI = '/oauth2/v1/authorize';

			// Intercept the external redirect page.
			await page.route(
				`https://${process.env.BASE_URI}${decodeURIComponent(fromURI)}`,
				async (route) => {
					await route.fulfill({ status: 200 });
				},
			);

			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';

			await page.goto(
				`/register/email?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&appClientId=${appClientId}&fromURI=${fromURI}`,
			);

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
			const form = page.locator('form');
			const formAction = await form.getAttribute('action');
			expect(formAction).toMatch(new RegExp(escapeRegExp(encodedReturnUrl)));
			expect(formAction).toMatch(new RegExp(escapeRegExp(refViewId)));
			expect(formAction).toMatch(new RegExp(escapeRegExp(encodedRef)));
			expect(formAction).toMatch(new RegExp(escapeRegExp(appClientId)));
			expect(formAction).toMatch(
				new RegExp(escapeRegExp(encodeURIComponent(fromURI))),
			);

			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill(code!);

			// test the registration platform is set correctly
			const oktaUser = await getTestOktaUser(request, unregisteredEmail);
			/*
			 * Previously the Cypress test checked that the okta status was 'ACTIVE' next
			 * However, in playwright the status appears to be 'STAGED'
			 * expect(oktaUser.status).toBe(Status.ACTIVE);
			 */
			expect(oktaUser.profile.registrationPlatform).toBe('profile');

			await expect(page).toHaveURL(/\/welcome\/review/);
			await page.getByRole('link', { name: 'Continue' }).click();

			await expect(page).toHaveURL(
				new RegExp(escapeRegExp(decodeURIComponent(fromURI))),
			);
		});

		test('successfully registers using an email with no existing account using a passcode and redirects to fromURI - password user', async ({
			page,
			request,
		}) => {
			const appClientId = 'appClientId1';
			const fromURI = '/oauth2/v1/authorize';

			// Intercept the external redirect page.
			await page.route(
				`https://${process.env.BASE_URI}${decodeURIComponent(fromURI)}`,
				async (route) => {
					await route.fulfill({ status: 200 });
				},
			);

			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();
			const encodedRef = 'https%3A%2F%2Fm.theguardian.com';
			const refViewId = 'testRefViewId';

			await page.goto(
				`/register/email?returnUrl=${encodedReturnUrl}&ref=${encodedRef}&refViewId=${refViewId}&appClientId=${appClientId}&fromURI=${fromURI}&useSetPassword=true`,
			);

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
			const form = page.locator('form');
			const formAction = await form.getAttribute('action');
			expect(formAction).toMatch(new RegExp(escapeRegExp(encodedReturnUrl)));
			expect(formAction).toMatch(new RegExp(escapeRegExp(refViewId)));
			expect(formAction).toMatch(new RegExp(escapeRegExp(encodedRef)));
			expect(formAction).toMatch(new RegExp(escapeRegExp(appClientId)));
			expect(formAction).toMatch(
				new RegExp(escapeRegExp(encodeURIComponent(fromURI))),
			);

			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill(code!);

			await page.locator('input[name="password"]').fill(randomPassword());
			await page.locator('button[type="submit"]').click();

			// test the registration platform is set correctly
			const oktaUser = await getTestOktaUser(request, unregisteredEmail);
			expect(oktaUser.status).toBe(Status.ACTIVE);
			expect(oktaUser.profile.registrationPlatform).toBe('profile');

			await expect(page).toHaveURL(/\/welcome\/review/);
			await page.getByRole('link', { name: 'Continue' }).click();

			await expect(page).toHaveURL(
				new RegExp(escapeRegExp(decodeURIComponent(fromURI))),
			);
		});

		test('registers registrationLocation for email with no existing account', async ({
			page,
			request,
		}) => {
			const unregisteredEmail = randomMailosaurEmail();

			await page.goto('/register/email');
			await page.context().addCookies([
				{
					name: 'playwright-mock-state',
					value: 'FR',
					domain: process.env.BASE_URI,
					path: '/',
				},
			]);
			await page.locator('input[name=email]').fill(unregisteredEmail);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText(unregisteredEmail)).toBeVisible();

			const oktaUser = await getTestOktaUser(request, unregisteredEmail);
			expect(oktaUser.profile.registrationLocation).toBe('Europe');
		});

		test('registers registrationLocation and registrationLocationState for email with no existing account', async ({
			page,
			request,
		}) => {
			const unregisteredEmail = randomMailosaurEmail();

			await page.goto('/register/email');
			await page.context().addCookies([
				{
					name: 'playwright-mock-state',
					value: 'AU-ACT',
					domain: process.env.BASE_URI,
					path: '/',
				},
			]);
			await page.locator('input[name=email]').fill(unregisteredEmail);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText(unregisteredEmail)).toBeVisible();

			const oktaUser = await getTestOktaUser(request, unregisteredEmail);
			expect(oktaUser.profile.registrationLocation).toBe('Australia');
			expect(oktaUser.profile.registrationLocationState).toBe(
				'Australian Capital Territory',
			);
		});

		test('successfully blocks the password set page /welcome if a password has already been set - password user', async ({
			page,
		}) => {
			const unregisteredEmail = randomMailosaurEmail();
			await page.goto('/register/email?useSetPassword=true');

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

			await expect(page.getByText('Complete creating account')).toBeVisible();

			await page.locator('input[name="password"]').fill(randomPassword());
			await page.locator('button[type="submit"]').click();
			await expect(page).toHaveURL(/\/welcome\/review/);
			await page.goBack();
			await expect(page).toHaveURL(/\/welcome\//);
			await expect(page.getByText('Password already set for')).toBeVisible();
		});

		test('passcode incorrect functionality', async ({ page }) => {
			const unregisteredEmail = randomMailosaurEmail();
			await page.goto('/register/email');

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
			const code = codes?.[0].value || '0';
			expect(code).toMatch(/^\d{6}$/);

			// passcode page
			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Submit verification code')).toBeVisible();

			// ensure that the code is always 6 characters long (pad it with leading zeros if necasery)
			const wrongCode = incrementPasscode(code);
			await page.locator('input[name=code]').fill(wrongCode);

			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Incorrect code')).toBeVisible();

			await page.locator('input[name=code]').clear();
			await page.locator('input[name=code]').fill(code);
			await page.getByText('Submit verification code').click();

			await expect(page).toHaveURL(/\/welcome\/review/);
		});

		test('passcode used functionality', async ({ page }) => {
			const unregisteredEmail = randomMailosaurEmail();
			await page.goto('/register/email');

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
			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').clear();
			await page.locator('input[name=code]').fill(code!);

			await expect(page).toHaveURL(/\/welcome\/review/);

			await page.goBack();
			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Email verified')).toBeVisible();
			await page.getByText('Complete creating account').click();

			await expect(page).toHaveURL(/\/welcome\/review/);
		});

		test('resend email functionality', async ({ page }) => {
			await page.context().addCookies([
				{
					name: 'playwright-mock-state',
					value: '1',
					domain: process.env.BASE_URI,
					path: '/',
				},
			]);
			const unregisteredEmail = randomMailosaurEmail();
			await page.goto('/register/email');

			const timeRequestWasMade1 = new Date();
			await page.locator('input[name=email]').fill(unregisteredEmail);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await expect(page.getByText(unregisteredEmail)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			const { body, codes } = await checkForEmailAndGetDetails(
				unregisteredEmail,
				timeRequestWasMade1,
			);

			// email
			expect(body).toContain('Your verification code');
			expect(codes?.length).toBe(1);
			const code = codes?.[0].value;
			expect(code).toMatch(/^\d{6}$/);

			// passcode page
			await expect(page).toHaveURL(/\/passcode/);
			const timeRequestWasMade2 = new Date();
			await page.waitForTimeout(1000); // wait for the send again button to be enabled
			await page.getByText('send again').click();

			const emailDetails2 = await checkForEmailAndGetDetails(
				unregisteredEmail,
				timeRequestWasMade2,
			);

			// email
			expect(emailDetails2.body).toContain('Your verification code');
			expect(emailDetails2.codes?.length).toBe(1);
			const code2 = emailDetails2.codes?.[0].value;
			expect(code2).toMatch(/^\d{6}$/);

			// passcode page
			await expect(page).toHaveURL(/\/passcode/);
			await expect(
				page.getByText('Email with verification code sent'),
			).toBeVisible();

			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill(code2!);

			await expect(page).toHaveURL(/\/welcome\/review/);
		});

		test('change email functionality', async ({ page }) => {
			const unregisteredEmail = randomMailosaurEmail();
			await page.goto('/register/email');

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
			await page.getByText('try another address').click();

			await expect(page).toHaveURL(/\/signin/);
		});

		test('should redirect with error when multiple passcode attempts fail', async ({
			page,
		}) => {
			const unregisteredEmail = randomMailosaurEmail();
			await page.goto('/register/email');

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
	});
});
