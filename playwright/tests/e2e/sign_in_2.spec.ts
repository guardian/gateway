import { test, expect } from '@playwright/test';
import { createTestUser } from '../../helpers/api/idapi';
import {
	getTestOktaUser,
	updateOktaTestUserProfile,
	closeCurrentOktaSession,
} from '../../helpers/api/okta';
import { JOBS_TOS_URI } from '@/shared/model/Configuration';

const returnUrl =
	'https://www.theguardian.com/world/2013/jun/09/edward-snowden-nsa-whistleblower-surveillance';

test.describe('Sign in flow, Okta enabled - split 2', () => {
	test.describe('Social sign in', () => {
		test('redirects correctly for social sign in', async ({ page }) => {
			await page.goto(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
			await expect(
				page.locator('[data-cy="google-sign-in-button"]'),
			).toHaveAttribute(
				'href',
				`/signin/google?returnUrl=${encodeURIComponent(returnUrl)}`,
			);
			await expect(
				page.locator('[data-cy="apple-sign-in-button"]'),
			).toHaveAttribute(
				'href',
				`/signin/apple?returnUrl=${encodeURIComponent(returnUrl)}`,
			);
		});

		test('redirects correctly for Google One Tap sign in', async ({ page }) => {
			await page.route('https://accounts.google.com/**/*', async (route) => {
				await route.fulfill({ status: 200 });
			});
			await page.goto(`/signin/google?signInEmail=test@email.com`);
			await expect(page).toHaveURL(/login_hint=test%40email\.com/);
		});

		test('shows an error message and information paragraph when accountLinkingRequired error parameter is present', async ({
			page,
		}) => {
			await page.goto('/signin?error=accountLinkingRequired');
			await expect(
				page.getByText(
					'We could not sign you in with your social account credentials. Please sign in with your email below.',
				),
			).toBeVisible();
			await expect(page.getByText('Social sign-in unsuccessful')).toBeVisible();
		});

		test('does not display social buttons when accountLinkingRequired error parameter is present', async ({
			page,
		}) => {
			await page.goto('/signin?error=accountLinkingRequired');
			await expect(
				page.locator('[data-cy="google-sign-in-button"]'),
			).not.toBeVisible();
			await expect(
				page.locator('[data-cy="apple-sign-in-button"]'),
			).not.toBeVisible();
		});
	});

	test.describe('Okta session refresh', () => {
		test('refreshes a valid Okta session', async ({
			request,
			page,
			context,
		}) => {
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
			const cookies = await context.cookies();
			const originalIdxCookie = cookies.find((c) => c.name === 'idx');
			expect(originalIdxCookie).toBeDefined();
			// we want to check the cookie is being set as a persistent cookie and not a session cookie, hence the expiry check
			expect(originalIdxCookie!.expires).toBeGreaterThan(0);

			// Refresh our user session
			await page.goto(
				`/signin/refresh?returnUrl=${encodeURIComponent(
					`https://${process.env.BASE_URI}/welcome/review`,
				)}`,
			);
			await expect(page).toHaveURL(/\/welcome\/review/);

			// Get the refreshed session data
			const refreshedCookies = await context.cookies();
			const newIdxCookie = refreshedCookies.find((c) => c.name === 'idx');
			expect(newIdxCookie).toBeDefined();
			// `idx` cookie doesn't have same value as original when refreshed
			expect(newIdxCookie!.value).not.toBe(originalIdxCookie!.value);
			// we want to check the cookie is being set as a persistent cookie and not a session cookie, hence the expiry check
			expect(newIdxCookie!.expires).toBeGreaterThan(0);
			if (newIdxCookie!.expires > 0 && originalIdxCookie!.expires > 0) {
				expect(newIdxCookie!.expires).toBeGreaterThan(
					originalIdxCookie!.expires,
				);
			}
		});

		test('sends a client with the Okta cookie and an invalid Okta session to the redirectUrl', async ({
			request,
			page,
			context,
		}) => {
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
			const cookies = await context.cookies();
			const idxCookie = cookies.find((c) => c.name === 'idx');
			expect(idxCookie).toBeDefined();

			// Close the user's current session in Okta
			await closeCurrentOktaSession(request, {
				idx: idxCookie!.value,
			});

			// closeCurrentOktaSession blanked the IDX cookie, so we
			// need to set it back to the old value
			await context.addCookies([
				{
					name: 'idx',
					value: idxCookie!.value,
					domain: process.env.BASE_URI!,
					path: '/',
					httpOnly: true,
					sameSite: 'None' as const,
					secure: true,
				},
			]);

			// Refresh our user session
			await page.goto(
				`/signin/refresh?returnUrl=${encodeURIComponent(
					`https://${process.env.BASE_URI}/reset-password`,
				)}`,
			);
			await expect(page).toHaveURL(/\/reset-password/);
		});

		test('sends a client without Okta cookies to /signin', async ({
			request,
			page,
			context,
		}) => {
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

			// Delete all cookies (Okta and IDAPI)
			await context.clearCookies();

			// Visit the refresh endpoint
			await page.goto(
				`/signin/refresh?returnUrl=${encodeURIComponent(
					`https://${process.env.BASE_URI}/welcome/review`,
				)}`,
			);
			await expect(page).toHaveURL(/\/signin/);

			const cookiesAfter = await context.cookies();
			expect(cookiesAfter.find((c) => c.name === 'idx')).toBeUndefined();
			expect(cookiesAfter.find((c) => c.name === 'sc_gu_u')).toBeUndefined();
			expect(cookiesAfter.find((c) => c.name === 'sc_gu_la')).toBeUndefined();
		});

		test('leaves the last access cookie unchanged when refreshing a valid Okta session', async ({
			request,
			page,
			context,
		}) => {
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
			const cookies = await context.cookies();
			const originalLastAccessCookie = cookies.find(
				(c) => c.name === 'SC_GU_LA',
			);
			const originalSecureIdapiCookie = cookies.find(
				(c) => c.name === 'SC_GU_U',
			);
			expect(originalLastAccessCookie).toBeDefined();
			expect(originalSecureIdapiCookie).toBeDefined();

			// Refresh our user session
			await page.goto(
				`/signin/refresh?returnUrl=${encodeURIComponent(
					`https://${process.env.BASE_URI}/welcome/review`,
				)}`,
			);
			await expect(page).toHaveURL(/\/welcome\/review/);

			// Expect the last access cookie to be unchanged
			const refreshedCookies = await context.cookies();
			const lastAccessCookie = refreshedCookies.find(
				(c) => c.name === 'SC_GU_LA',
			);
			expect(lastAccessCookie).toBeDefined();
			expect(lastAccessCookie!.value).toBe(originalLastAccessCookie!.value);
			expect(lastAccessCookie!.expires).toBe(originalLastAccessCookie!.expires);

			// Expect other Idapi cookies to have changed
			const secureIdapiCookie = refreshedCookies.find(
				(c) => c.name === 'SC_GU_U',
			);
			expect(secureIdapiCookie).toBeDefined();
			expect(secureIdapiCookie!.value).not.toBe(
				originalSecureIdapiCookie!.value,
			);
			if (
				secureIdapiCookie!.expires > 0 &&
				originalSecureIdapiCookie!.expires > 0
			) {
				expect(secureIdapiCookie!.expires).toBeGreaterThan(
					originalSecureIdapiCookie!.expires,
				);
			}
		});
	});

	test.describe('Okta session exists on /signin', () => {
		test.beforeEach(async ({ page }) => {
			await page.route('https://m.code.dev-theguardian.com/', async (route) => {
				await route.fulfill({ status: 200 });
			});
		});

		test('shows the signed in as page', async ({ request, page, context }) => {
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
			const cookies = await context.cookies();
			const originalIdxCookie = cookies.find((c) => c.name === 'idx');
			expect(originalIdxCookie).toBeDefined();

			// Visit sign in again
			await page.goto(
				`/signin?returnUrl=${encodeURIComponent(
					`https://${process.env.BASE_URI}/welcome/review`,
				)}`,
			);
			await expect(page).toHaveURL(/\/signin/);

			await expect(page.getByText('Sign in to the Guardian')).toBeVisible();
			await expect(page.getByText('You are signed in with')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();

			const continueLink = page.getByRole('link', { name: 'Continue' });
			await expect(continueLink).toHaveAttribute(
				'href',
				new RegExp(
					`https://${process.env.BASE_URI}/signin/refresh\\?returnUrl=https%3A%2F%2Fprofile\\.thegulocal\\.com%2Fwelcome%2Freview`,
				),
			);

			const signOutLink = page.locator('a[href*="/signout?returnUrl="]');
			await expect(signOutLink).toBeVisible();
			await expect(signOutLink).toContainText('Sign in');

			await expect(
				page.getByText('Sign in with a different email'),
			).toBeVisible();
		});

		test('shows the signed in as page - jobs', async ({
			request,
			page,
			context,
		}) => {
			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			await page.goto(
				`/signin?returnUrl=${encodeURIComponent(
					`https://${process.env.BASE_URI}/welcome/review`,
				)}&usePasswordSignIn=true`,
			);
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page).toHaveURL(/\/welcome\/review/);

			const cookies = await context.cookies();
			const originalIdxCookie = cookies.find((c) => c.name === 'idx');
			expect(originalIdxCookie).toBeDefined();

			await page.goto(
				`/signin?fromURI=${encodeURIComponent('/oauth2/')}&clientId=jobs`,
			);
			await expect(page).toHaveURL(/\/signin/);

			await expect(page.getByText('Sign in with the Guardian')).toBeVisible();
			await expect(page.getByText('You are signed in with')).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(
				page.getByText('If this is your first time using Guardian Jobs'),
			).toBeVisible();

			const continueHref = await page
				.getByRole('link', { name: 'Continue' })
				.getAttribute('href');
			expect(continueHref).toContain(
				`fromURI=${encodeURIComponent('/oauth2/')}`,
			);
			expect(continueHref).toContain(JOBS_TOS_URI);

			const signOutLink = page.locator('a[href*="/signout?returnUrl="]');
			await expect(signOutLink).toBeVisible();
			await expect(signOutLink).toContainText('Sign in');

			await expect(
				page.getByText('Sign in with a different email'),
			).toBeVisible();
		});
	});

	test.describe('Okta missing legacyIdentityId', () => {
		test('Adds the missing legacyIdentityId to the user on authentication', async ({
			request,
			page,
		}) => {
			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			const user = await getTestOktaUser(request, emailAddress);
			const originalLegacyIdentityId = user.profile.legacyIdentityId;
			expect(originalLegacyIdentityId).toBeDefined();

			// Remove the legacyIdentityId from the user
			await updateOktaTestUserProfile(request, emailAddress, {
				legacyIdentityId: null,
			});

			const updatedUser = await getTestOktaUser(request, emailAddress);
			expect(updatedUser.profile.legacyIdentityId).toBeUndefined();

			const postSignInReturnUrl = `https://${process.env.BASE_URI}/welcome/review`;
			const visitUrl = `/signin?returnUrl=${encodeURIComponent(
				postSignInReturnUrl,
			)}&usePasswordSignIn=true`;
			await page.goto(visitUrl);
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page).toHaveURL(/\/welcome\/review/);

			const finalUser = await getTestOktaUser(request, emailAddress);
			expect(finalUser.profile.legacyIdentityId).toBe(originalLegacyIdentityId);
		});
	});
});
