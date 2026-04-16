import { test, expect } from '@playwright/test';
import {
	randomMailosaurEmail,
	randomPassword,
	createTestUser,
} from '../../helpers/api/idapi';
import { checkForEmailAndGetDetails } from '../../helpers/api/mailosaur';
import {
	getTestOktaUser,
	getOktaUserGroups,
	addOktaUserToGroup,
	findEmailValidatedOktaGroupId,
} from '../../helpers/api/okta';
import { escapeRegExp } from '../../helpers/utils';

const returnUrl =
	'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';

test.describe('Sign in flow, Okta enabled - split 1', () => {
	test.describe('Page tests', () => {
		test('links to the Guardian terms and conditions page', async ({
			page,
		}) => {
			const guardianTermsOfServiceUrl =
				'https://www.theguardian.com/help/terms-of-service';
			await page.route(guardianTermsOfServiceUrl, async (route) => {
				await route.fulfill({ status: 200 });
			});
			await page.goto('/signin');
			await page.getByText('terms and conditions').click();
			await expect(page).toHaveURL(guardianTermsOfServiceUrl);
		});

		test('links to the Guardian privacy policy page', async ({ page }) => {
			const guardianPrivacyPolicyUrl =
				'https://www.theguardian.com/help/privacy-policy';
			await page.route(guardianPrivacyPolicyUrl, async (route) => {
				await route.fulfill({ status: 200 });
			});
			await page.goto('/signin');
			await page
				.getByText(
					'For more information about how we use your data, including the generation of random identifiers',
				)
				.getByRole('link', { name: 'privacy policy' })
				.click();
			await expect(page).toHaveURL(guardianPrivacyPolicyUrl);
		});

		test('navigates to reset password', async ({ page }) => {
			await page.goto('/signin?usePasswordSignIn=true');
			await page.getByText('Reset password').click();
			await expect(page.getByText('Reset password')).toBeVisible();
		});

		test('navigates to registration', async ({ page }) => {
			await page.goto('/signin');
			await expect(page.getByText('Continue with Google')).toBeVisible();
			await expect(page.getByText('Continue with Apple')).toBeVisible();
			await expect(page.locator('input[name=email]')).toBeVisible();
		});

		test('removes encryptedEmail parameter from query string', async ({
			page,
		}) => {
			const encryptedEmailParam = 'encryptedEmail=bhvlabgflbgyil';
			await page.goto(`/signin?${encryptedEmailParam}`);

			const url = new URL(page.url());
			expect(url.search).not.toContain(encryptedEmailParam);
		});

		test('removes encryptedEmail parameter and preserves all other valid parameters', async ({
			page,
		}) => {
			const encryptedEmailParam = 'encryptedEmail=bhvlabgflbgyil';
			await page.goto(
				`/signin?returnUrl=${encodeURIComponent(
					returnUrl,
				)}&${encryptedEmailParam}&refViewId=12345&clientId=jobs`,
			);

			const url = new URL(page.url());
			expect(url.search).not.toContain(encryptedEmailParam);
			expect(url.search).toContain('refViewId=12345');
			expect(url.search).toContain('clientId=jobs');
			expect(url.search).toContain(encodeURIComponent(returnUrl));
		});

		test('applies form validation to email and password input fields', async ({
			page,
		}) => {
			await page.goto('/signin?usePasswordSignIn=true');

			await expect(page.locator('form input:invalid')).toHaveCount(2);
			await page.locator('input[name=email]').fill('not an email');
			await expect(page.locator('form input:invalid')).toHaveCount(2);
			await page
				.locator('input[name=email]')
				.fill('emailaddress@inavalidformat.com');
			await expect(page.locator('form input:invalid')).toHaveCount(1);
			await page.locator('input[name=password]').fill('password');
			await expect(page.locator('form input:invalid')).toHaveCount(0);
		});
	});

	test.describe('Okta Classic API Sign In', () => {
		test('shows a message when credentials are invalid', async ({ page }) => {
			await page.goto('/signin?useOktaClassic=true');
			await page.locator('input[name=email]').fill('invalid@doesnotexist.com');
			await page.locator('input[name=password]').fill('password');
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(
				page.getByText('Email and password don\u2019t match'),
			).toBeVisible();
		});

		test('correctly signs in an existing user', async ({ request, page }) => {
			await page.route('https://m.code.dev-theguardian.com/', async (route) => {
				await route.fulfill({ status: 200 });
			});
			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});
			await page.goto('/signin?useOktaClassic=true');
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page).toHaveURL(/https:\/\/m\.code\.dev-theguardian\.com\//);
		});

		test('respects the returnUrl query param', async ({ request, page }) => {
			await page.route(returnUrl, async (route) => {
				await route.fulfill({ status: 200 });
			});
			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});
			await page.goto(
				`/signin?returnUrl=${encodeURIComponent(returnUrl)}&useOktaClassic=true`,
			);
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page).toHaveURL(returnUrl);
		});

		test('hits access token rate limit and recovers token after timeout', async ({
			request,
			page,
		}) => {
			test.skip(
				!process.env.RATE_LIMITER_CONFIG,
				'Rate limiter not configured',
			);
			await page.route('https://m.code.dev-theguardian.com/', async (route) => {
				await route.fulfill({ status: 200 });
			});
			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});
			await page.goto('/signin?useOktaClassic=true');
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page).toHaveURL(/https:\/\/m\.code\.dev-theguardian\.com\//);

			// We visit reauthenticate here because if we visit /signin or
			// /register, the logged in user guard will redirect us away before
			// the ratelimiter has a chance to work
			await page.goto('/reauthenticate');
			await expect(
				page.getByRole('heading', { name: 'Sign in' }),
			).toBeVisible();
			await page.reload();
			await page.reload();
			await page.reload();
			await page.reload();
			await page.reload();
			await page.reload();
			await page.reload();
			await page.reload();
			await page.reload();
			await page.reload();
			await expect(page.getByText('Rate limit exceeded')).toBeVisible();
		});

		test('Sends a user with an unvalidated email a reset password email on sign in', async ({
			request,
			page,
		}) => {
			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: false,
			});
			const timeRequestWasMade = new Date();
			await page.goto('/signin?useOktaClassic=true');
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page).toHaveURL(/\/signin\/email-sent/);
			await expect(
				page.getByText(
					'For security reasons we need you to change your password.',
				),
			).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('send again')).toBeVisible();
			await expect(page.getByText('try another address')).toBeVisible();

			// Ensure the user's authentication cookies are not set
			const cookies = await page.context().cookies();
			const idxCookie = cookies.find((c) => c.name === 'idx');
			expect(idxCookie).toBeUndefined();

			const { links, body, token } = await checkForEmailAndGetDetails(
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
			expect(resetPasswordLink?.href ?? '').toContain('reset-password');
			await page.goto(`/reset-password/${token}`);
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(page.getByText('Create new password')).toBeVisible();
		});

		test('sets emailValidated flag on oauth callback', async ({
			request,
			page,
		}) => {
			// this is a specific test case for new user registrations in Okta
			// In Okta new social registered users are added to the GuardianUser-EmailValidated group
			// by default, but the custom emailValidated field is not defined/set to false
			// this causes problems in legacy code, where the emailValidated flag is not set but the group is
			// so we need to set the flag to true when the user is added to the group
			// we do this on the oauth callback route /oauth/authorization-code/callback
			// where we update the user profile with the emailValidated flag if the user is in the GuardianUser-EmailValidated group but the emailValidated is falsy

			// This test checks this behaviour by first getting a user into this state
			// i.e user.profile.emailValidated = false, and user groups has GuardianUser-EmailValidated

			// first we have to get the id of the GuardianUser-EmailValidated group
			const groupId = await findEmailValidatedOktaGroupId(request);

			// next we create a test user
			const { emailAddress, finalPassword } = await createTestUser(request, {});

			// we get the user profile object from Okta
			const user = await getTestOktaUser(request, emailAddress);
			const { id, profile } = user;

			// check the user profile has the emailValidated flag set to false
			expect(profile.emailValidated).toBe(false);

			// next check the user groups
			const groups = await getOktaUserGroups(request, id);

			// make sure the user is not in the GuardianUser-EmailValidated group
			const group = groups.find((g) => g.id === groupId);
			expect(group).toBeUndefined();

			// and add them to the group if this is the case
			await addOktaUserToGroup(request, id, groupId);

			// at this point the user is in the correct state
			// so we attempt to sign them in
			await page.goto(
				`/signin?returnUrl=${encodeURIComponent(
					`https://${process.env.BASE_URI}/welcome/review`,
				)}&usePasswordSignIn=true`,
			);
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page).toHaveURL(/\/welcome\/review/);

			// at this point the oauth callback route will have run, so we can recheck the user profile to see if the emailValidated flag has been set
			const updatedUser = await getTestOktaUser(request, id);
			expect(updatedUser.profile.emailValidated).toBe(true);

			// and the user should also be in the group
			const updatedGroups = await getOktaUserGroups(request, id);
			const updatedGroup = updatedGroups.find((g) => g.id === groupId);
			expect(updatedGroup).toBeDefined();
		});
	});

	test.describe('Okta IDX API Sign In with Password', () => {
		test('ACTIVE user - email + password authenticators - successfully sign in', async ({
			request,
			page,
		}) => {
			await page.route('https://m.code.dev-theguardian.com/', async (route) => {
				await route.fulfill({ status: 200 });
			});
			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});
			await page.goto('/signin?usePasswordSignIn=true');
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page).toHaveURL(/https:\/\/m\.code\.dev-theguardian\.com\//);
		});

		test('ACTIVE user - email + password authenticators - successfully sign in - preserve returnUrl', async ({
			request,
			page,
		}) => {
			await page.route(returnUrl, async (route) => {
				await route.fulfill({ status: 200 });
			});
			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});
			await page.goto(
				`/signin?returnUrl=${encodeURIComponent(returnUrl)}&usePasswordSignIn=true`,
			);
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page).toHaveURL(returnUrl);
		});

		test('ACTIVE user - email + password authenticators - successfully sign in - preserve fromURI', async ({
			request,
			page,
		}) => {
			const encodedReturnUrl = encodeURIComponent(returnUrl);
			const appClientId = 'appClientId1';
			const fromURI = '/oauth2/v1/authorize';

			await page.route(
				`https://${process.env.BASE_URI}${decodeURIComponent(fromURI)}`,
				async (route) => {
					await route.fulfill({ status: 200 });
				},
			);

			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});
			await page.goto(
				`/signin?returnUrl=${encodedReturnUrl}&usePasswordSignIn=true`,
			);
			await page.goto(
				`/signin?returnUrl=${encodedReturnUrl}&appClientId=${appClientId}&fromURI=${fromURI}&usePasswordSignIn=true`,
			);
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			// fromURI redirect
			await expect(page).toHaveURL(
				new RegExp(escapeRegExp(decodeURIComponent(fromURI))),
			);
		});

		test('ACTIVE user - password authenticator only - send OTP reset password security email', async ({
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
			// we instead reset their password using classic flow to set a password
			await page.goto('/reset-password?useOktaClassic=true');

			const timeRequestWasMade2 = new Date();
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

			// setup complete, now sign in
			await page.goto('/signin?usePasswordSignIn=true');
			await page.getByText('Sign in with a different email').click();
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(password);

			const timeRequestWasMade3 = new Date();
			await page.locator('[data-cy="main-form-submit-button"]').click();

			const { body: body3, codes: codes3 } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade3,
			);

			// email
			expect(body3).toContain('Your verification code');
			expect(codes3?.length).toBe(1);
			const code3 = codes3?.[0].value;
			expect(code3).toMatch(/^\d{6}$/);

			// passcode page
			await expect(page).toHaveURL(/\/signin\/email-sent/);
			await expect(
				page.getByText('Enter your verification code'),
			).toBeVisible();
			await expect(
				page.getByText(
					'For security reasons we need you to change your password.',
				),
			).toBeVisible();
			await expect(page.getByText('Submit verification code')).toBeVisible();
			await page.locator('input[name=code]').fill(code3!);

			await expect(page).toHaveURL(/\/set-password/);

			await page.locator('input[name="password"]').fill(randomPassword());
			await page.locator('button[type="submit"]').click();

			await expect(page).toHaveURL(/\/set-password\/complete/);
		});

		test('ACTIVE user - email + password authenticators - shows authentication error when password incorrect', async ({
			request,
			page,
		}) => {
			await page.route('https://m.code.dev-theguardian.com/', async (route) => {
				await route.fulfill({ status: 200 });
			});
			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});
			await page.goto('/signin?usePasswordSignIn=true');
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(`${finalPassword}!`);
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(
				page.getByText('Email and password don\u2019t match'),
			).toBeVisible();
		});

		test('NON-EXISTENT user - shows authentication error in all scenarios', async ({
			page,
		}) => {
			await page.goto('/signin?usePasswordSignIn=true');
			await page.locator('input[name=email]').fill('invalid@doesnotexist.com');
			await page.locator('input[name=password]').fill('password');
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(
				page.getByText('Email and password don\u2019t match'),
			).toBeVisible();
		});

		test('NON-ACTIVE user - shows authentication error', async ({
			request,
			page,
		}) => {
			await page.route('https://m.code.dev-theguardian.com/', async (route) => {
				await route.fulfill({ status: 200 });
			});
			const { emailAddress, finalPassword } = await createTestUser(request, {
				isGuestUser: true,
			});
			await page.goto('/signin?usePasswordSignIn=true');
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(
				page.getByText('Email and password don\u2019t match'),
			).toBeVisible();
		});

		test('SOCIAL user - sets emailValidated flag on oauth callback', async ({
			request,
			page,
		}) => {
			// this is a specific test case for new user registrations in Okta
			// In Okta new social registered users are added to the GuardianUser-EmailValidated group
			// by default, but the custom emailValidated field is not defined/set to false
			// this causes problems in legacy code, where the emailValidated flag is not set but the group is
			// so we need to set the flag to true when the user is added to the group
			// we do this on the oauth callback route /oauth/authorization-code/callback
			// where we update the user profile with the emailValidated flag if the user is in the GuardianUser-EmailValidated group but the emailValidated is falsy

			// This test checks this behaviour by first getting a user into this state
			// i.e user.profile.emailValidated = false, and user groups has GuardianUser-EmailValidated

			// first we have to get the id of the GuardianUser-EmailValidated group
			const groupId = await findEmailValidatedOktaGroupId(request);

			// next we create a test user
			const { emailAddress, finalPassword } = await createTestUser(request, {});

			// we get the user profile object from Okta
			const user = await getTestOktaUser(request, emailAddress);
			const { id, profile } = user;

			// check the user profile has the emailValidated flag set to false
			expect(profile.emailValidated).toBe(false);

			// next check the user groups
			const groups = await getOktaUserGroups(request, id);

			// make sure the user is not in the GuardianUser-EmailValidated group
			const group = groups.find((g) => g.id === groupId);
			expect(group).toBeUndefined();

			// and add them to the group if this is the case
			await addOktaUserToGroup(request, id, groupId);

			// at this point the user is in the correct state
			// so we attempt to sign them in
			await page.goto(
				`/signin?returnUrl=${encodeURIComponent(
					`https://${process.env.BASE_URI}/welcome/review`,
				)}&usePasswordSignIn=true`,
			);
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page).toHaveURL(/\/welcome\/review/);

			// at this point the oauth callback route will have run, so we can recheck the user profile to see if the emailValidated flag has been set
			const updatedUser = await getTestOktaUser(request, id);
			expect(updatedUser.profile.emailValidated).toBe(true);

			// and the user should also be in the group
			const updatedGroups = await getOktaUserGroups(request, id);
			const updatedGroup = updatedGroups.find((g) => g.id === groupId);
			expect(updatedGroup).toBeDefined();
		});

		test('shows reCAPTCHA errors when the user tries to sign in offline and allows sign in when back online', async ({
			request,
			page,
		}) => {
			await page.route('https://m.code.dev-theguardian.com/', async (route) => {
				await route.fulfill({ status: 200 });
			});
			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});
			await page.goto('/signin?usePasswordSignIn=true');

			// Intercept reCAPTCHA POST requests once to simulate failure
			// eslint-disable-next-line functional/no-let -- easiest way to control single recaptcha interception
			let recaptchaIntercepted = false;
			await page.route('**/www.google.com/recaptcha/api2/**', async (route) => {
				if (!recaptchaIntercepted && route.request().method() === 'POST') {
					recaptchaIntercepted = true;
					await route.fulfill({ status: 500 });
				} else {
					await route.continue();
				}
			});

			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(
				page.getByText('Google reCAPTCHA verification failed.'),
			).toBeVisible();
			await expect(
				page.getByText('If the problem persists please try the following:'),
			).toBeVisible();

			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(
				page.getByText('Google reCAPTCHA verification failed.'),
			).not.toBeVisible();

			await expect(page).toHaveURL(/https:\/\/m\.code\.dev-theguardian\.com\//);
		});
	});
});
