import { test, expect } from '@playwright/test';
import { createTestUser } from '../../helpers/api/idapi';

test.describe('Sign out flow', () => {
	const DotComCookies = [
		'gu_user_features_expiry',
		'gu_user_benefits_expiry',
		'gu_paying_member',
		'gu_recurring_contributor',
		'gu_digital_subscriber',
		'gu_allow_reject_all',
	];

	test.describe('Signs a user out', () => {
		test('Removes Okta cookies and dotcom cookies when signing out', async ({
			request,
			page,
			context,
		}) => {
			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			// load the new account review page as it's on the same domain
			const postSignInReturnUrl = `https://${process.env.BASE_URI}/welcome/review`;
			const visitUrl = `/signin?returnUrl=${encodeURIComponent(
				postSignInReturnUrl,
			)}&usePasswordSignIn=true`;

			await page.goto(visitUrl);
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page).toHaveURL(/\/welcome\/review/);

			// check session cookie is set
			const cookies = await context.cookies();
			expect(cookies.find((c) => c.name === 'idx')).toBeDefined();
			// check idapi cookies are set
			expect(cookies.find((c) => c.name === 'SC_GU_U')).toBeDefined();
			expect(cookies.find((c) => c.name === 'SC_GU_LA')).toBeDefined();
			expect(cookies.find((c) => c.name === 'GU_U')).toBeDefined();

			// Dotcom cookies might have been set on the base domain
			const baseDomain = process.env.BASE_URI?.replace('profile.', '.');
			for (const cookie of DotComCookies) {
				await context.addCookies([
					{
						name: cookie,
						value: `the_${cookie}_cookie`,
						domain: baseDomain || '.thegulocal.com',
						path: '/',
					},
				]);
			}

			// attempt to sign out and redirect to sign in to make sure the cookies are removed
			// and the signed in as page isn't visible
			const postSignOutReturnUrl = `https://${process.env.BASE_URI}/signin`;
			await page.goto(
				`/signout?returnUrl=${encodeURIComponent(postSignOutReturnUrl)}`,
			);

			// check cookies are removed
			const cookiesAfterSignout = await context.cookies();
			expect(cookiesAfterSignout.find((c) => c.name === 'sid')).toBeUndefined();
			expect(cookiesAfterSignout.find((c) => c.name === 'idx')).toBeUndefined();
			expect(
				cookiesAfterSignout.find((c) => c.name === 'SC_GU_U'),
			).toBeUndefined();
			expect(
				cookiesAfterSignout.find((c) => c.name === 'SC_GU_LA'),
			).toBeUndefined();
			expect(
				cookiesAfterSignout.find((c) => c.name === 'GU_U'),
			).toBeUndefined();

			for (const cookie of DotComCookies) {
				expect(
					cookiesAfterSignout.find((c) => c.name === cookie),
				).toBeUndefined();
			}
		});
	});
});
