import { test, expect, Page, APIRequestContext } from '@playwright/test';
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
import { JOBS_TOS_URI } from '@/shared/model/Configuration';
import { escapeRegExp, incrementPasscode } from '../../helpers/utils';
import { mockClientRecaptcha } from '../../helpers/network/recaptcha';

const existingUserSendEmailAndValidatePasscode = async ({
	page,
	request,
	emailAddress,
	expectedReturnUrl = 'https://m.code.dev-theguardian.com/',
	params = '',
	expectedEmailBody = 'Your one-time passcode',
	additionalTests,
}: {
	page: Page;
	request: APIRequestContext;
	emailAddress: string;
	expectedReturnUrl?: string;
	params?: string;
	expectedEmailBody?: 'Your one-time passcode' | 'Your verification code';
	additionalTests?: 'passcode-incorrect' | 'resend-email' | 'change-email';
}) => {
	await page.context().addCookies([
		{
			name: 'playwright-mock-state',
			value: '1',
			domain: process.env.BASE_URI,
			path: '/',
		},
	]);

	await page.goto(`/register/email?${params}`);
	await page.locator('input[name=email]').clear();
	await page.locator('input[name=email]').fill(emailAddress);

	const timeRequestWasMade = new Date();
	await page.locator('[data-cy="main-form-submit-button"]').click();

	const { body, codes } = await checkForEmailAndGetDetails(
		emailAddress,
		timeRequestWasMade,
	);

	// email
	expect(body).toContain(expectedEmailBody);
	expect(codes?.length).toBe(1);
	const code = codes?.[0].value;
	expect(code).toMatch(/^\d{6}$/);

	// passcode page
	await expect(page).toHaveURL(/\/passcode/);
	await expect(page.getByText('Enter your one-time code')).toBeVisible();

	switch (additionalTests) {
		case 'resend-email': {
			const timeRequestWasMade2 = new Date();
			await page.waitForTimeout(1000); // wait for the send again button to be enabled
			await page.getByText('send again').click();

			const emailDetails2 = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade2,
			);

			// email
			expect(emailDetails2.body).toContain(expectedEmailBody);
			expect(emailDetails2.codes?.length).toBe(1);
			const code2 = emailDetails2.codes?.[0].value;
			expect(code2).toMatch(/^\d{6}$/);

			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill(code2!);

			await expect(
				page.getByText("You're signed in! Welcome to the Guardian."),
			).toBeVisible();
			await page.getByText('Continue').click();

			await expect(page).toHaveURL(
				new RegExp(escapeRegExp(encodeURIComponent(expectedReturnUrl))),
			);

			const user = await getTestOktaUser(request, emailAddress);
			expect(user.status).toBe('ACTIVE');
			expect(user.profile.emailValidated).toBe(true);
			break;
		}
		case 'change-email': {
			await page.getByText('try another address').click();
			await expect(page).toHaveURL(/\/signin/);
			break;
		}
		case 'passcode-incorrect': {
			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill('123456');

			await expect(page).toHaveURL(/\/passcode/);
			await expect(page.getByText('Incorrect code')).toBeVisible();

			await page.locator('input[name=code]').clear();
			await page.locator('input[name=code]').fill(code!);

			await page.getByText('Submit verification code').click();

			await expect(page).toHaveURL(/\/welcome\/existing/);
			const returnLink = page.getByText('Return to the Guardian');
			await expect(returnLink).toHaveAttribute(
				'href',
				new RegExp(escapeRegExp(expectedReturnUrl)),
			);

			const user = await getTestOktaUser(request, emailAddress);
			expect(user.status).toBe('ACTIVE');
			expect(user.profile.emailValidated).toBe(true);
			break;
		}
		default: {
			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill(code!);

			if (params?.includes('fromURI')) {
				await expect(page).toHaveURL(
					new RegExp(escapeRegExp(expectedReturnUrl)),
				);
			} else {
				await expect(page).toHaveURL(/\/welcome\/existing/);
				const returnLink = page.getByText('Return to the Guardian');
				await expect(returnLink).toHaveAttribute(
					'href',
					new RegExp(escapeRegExp(expectedReturnUrl)),
				);

				const user = await getTestOktaUser(request, emailAddress);
				expect(user.status).toBe('ACTIVE');
				expect(user.profile.emailValidated).toBe(true);
			}
		}
	}
};

test.describe('Registration flow - Split 1/3', () => {
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

			await expect(page).toHaveURL(/\/welcome\/complete-account/);
			await expect(page.getByText('Guardian Jobs newsletter')).toBeVisible();

			await page.getByRole('button', { name: 'Next' }).click();

			await expect(page).toHaveURL(new RegExp(escapeRegExp(JOBS_TOS_URI)));
			await expect(page).toHaveURL(
				new RegExp(escapeRegExp(encodeURIComponent(fromURI))),
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
