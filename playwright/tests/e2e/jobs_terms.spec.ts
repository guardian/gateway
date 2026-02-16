import { test, expect } from '@playwright/test';
import { createTestUser } from '../../helpers/api/idapi';
import {
	getTestOktaUser,
	updateOktaTestUserProfile,
} from '../../helpers/api/okta';
import { JOBS_TOS_URI } from '@/shared/model/Configuration';

test.describe('Jobs terms and conditions flow in Okta', () => {
	test.describe('Shows the terms and conditions page on Sign In', () => {
		test(`visits ${JOBS_TOS_URI} after sign in if clientId=jobs parameter is set`, async ({
			request,
			page,
		}) => {
			await page.route('https://jobs.theguardian.com/', async (route) => {
				await route.fulfill({ status: 200 });
			});

			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			const visitUrl =
				'/signin?clientId=jobs&returnUrl=https%3A%2F%2Fjobs.theguardian.com%2F&usePasswordSignIn=true';
			await page.goto(visitUrl);
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page).toHaveURL(new RegExp(JOBS_TOS_URI));
			await page.locator('[data-cy="main-form-submit-button"]').click();
			await expect(page).toHaveURL(/https:\/\/jobs\.theguardian\.com\//);
		});
	});

	test.describe('Accepts Jobs terms and conditions and sets their name', () => {
		test('should redirect users with an invalid session cookie to reauthenticate', async ({
			page,
			context,
		}) => {
			// load the consents page as its on the same domain
			const termsAcceptPageUrl = `https://${process.env.BASE_URI}${JOBS_TOS_URI}?returnUrl=https://profile.thegulocal.com/signin?returnUrl=https%3A%2F%2Fm.code.dev-theguardian.com%2F`;
			await context.addCookies([
				{
					name: 'idx',
					value: 'invalid-cookie',
					domain: 'profile.thegulocal.com',
					path: '/',
				},
			]);
			await page.goto(termsAcceptPageUrl);
			await expect(page).toHaveURL(
				/https:\/\/profile\.thegulocal\.com\/reauthenticate/,
			);
		});

		test('should redirect users with no session cookie to the signin page', async ({
			page,
		}) => {
			// load the consents page as its on the same domain
			const termsAcceptPageUrl = `https://${process.env.BASE_URI}${JOBS_TOS_URI}?returnUrl=https://profile.thegulocal.com/healthcheck`;
			await page.goto(termsAcceptPageUrl);
			await expect(page).toHaveURL(
				/https:\/\/profile\.thegulocal\.com\/signin\?returnUrl=/,
			);
		});

		test('should show the jobs terms page for users who do not have first/last name set, but are jobs users', async ({
			request,
			page,
			context,
		}) => {
			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			// load the consents page as its on the same domain
			const postSignInReturnUrl = `https://${process.env.BASE_URI}/welcome/review`;
			const visitUrl = `/signin?returnUrl=${encodeURIComponent(
				postSignInReturnUrl,
			)}&usePasswordSignIn=true`;
			await page.goto(visitUrl);
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);

			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page).toHaveURL(/\/welcome\/review/);

			const termsAcceptPageUrl = `https://${process.env.BASE_URI}${JOBS_TOS_URI}?returnUrl=https://profile.thegulocal.com/healthcheck`;

			// Create a test user without a first/last name who has `isJobsUser` set to true.
			await updateOktaTestUserProfile(request, emailAddress, {
				firstName: '',
				lastName: '',
				isJobsUser: true,
			});

			// clear oauth token cookies to simulate the user profile update
			const cookies = await context.cookies();
			await context.clearCookies();
			const cookiesExceptOAuth = cookies.filter(
				(c) => c.name !== 'GU_ID_TOKEN' && c.name !== 'GU_ACCESS_TOKEN',
			);
			await context.addCookies(cookiesExceptOAuth);

			await page.goto(termsAcceptPageUrl);
			await expect(
				page.getByText('Please complete your details for'),
			).toBeVisible();
			await expect(page.getByText(emailAddress)).toBeVisible();
			await expect(
				page.getByText('We will use these details on your job applications'),
			).toBeVisible();

			await expect(page.locator('input[name=firstName]')).toHaveValue('');
			await expect(page.locator('input[name=secondName]')).toHaveValue('');

			await page.locator('input[name=firstName]').fill('First Name');
			await page.locator('input[name=secondName]').fill('Second Name');

			await page.getByText('Save and continue').click();

			// User should have `isJobsUser` set to true and First/Last name set to our custom values.
			const user = await getTestOktaUser(request, emailAddress);
			expect(user.status).toEqual('ACTIVE');
			expect(user.profile.firstName).toEqual('First Name');
			expect(user.profile.lastName).toEqual('Second Name');
			expect(user.profile.isJobsUser).toEqual(true);
		});

		test('should redirect users who have already accepted the terms away', async ({
			request,
			page,
		}) => {
			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			const termsAcceptPageUrl = `https://${process.env.BASE_URI}${JOBS_TOS_URI}?returnUrl=https://profile.thegulocal.com/healthcheck`;

			// load the consents page as its on the same domain
			const postSignInReturnUrl = `https://${process.env.BASE_URI}/welcome/review`;
			const visitUrl = `/signin?returnUrl=${encodeURIComponent(
				postSignInReturnUrl,
			)}&usePasswordSignIn=true`;
			await page.goto(visitUrl);
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);

			await page.locator('[data-cy="main-form-submit-button"]').click();

			await expect(page).toHaveURL(/\/welcome\/review/);

			await updateOktaTestUserProfile(request, emailAddress, {
				firstName: 'Test',
				lastName: 'User',
				isJobsUser: true,
			});

			await page.goto(termsAcceptPageUrl);

			await expect(page).toHaveURL(
				/https:\/\/profile\.thegulocal\.com\/healthcheck/,
			);

			const finalTermsAcceptPageUrl = `https://${process.env.BASE_URI}${JOBS_TOS_URI}?returnUrl=https://profile.thegulocal.com/welcome/review`;

			await page.goto(finalTermsAcceptPageUrl, { waitUntil: 'networkidle' });

			await expect(page).toHaveURL(
				/https:\/\/profile\.thegulocal\.com\/welcome\/review/,
			);
		});

		test('should allow a non-jobs user to enter their first/last name and accept the terms', async ({
			request,
			page,
		}) => {
			const { emailAddress, finalPassword } = await createTestUser(request, {
				isUserEmailValidated: true,
			});

			const termsAcceptPageUrl = `https://${process.env.BASE_URI}${JOBS_TOS_URI}?returnUrl=https://jobs.theguardian.com/`;

			// load the consents page as its on the same domain
			const postSignInReturnUrl = `https://${process.env.BASE_URI}/welcome/review`;
			const visitUrl = `/signin?returnUrl=${encodeURIComponent(
				postSignInReturnUrl,
			)}&usePasswordSignIn=true`;
			await page.goto(visitUrl);
			await page.locator('input[name=email]').fill(emailAddress);
			await page.locator('input[name=password]').fill(finalPassword);

			await page.getByRole('button', { name: 'Sign in' }).click();

			await expect(page).toHaveURL(/\/welcome\/review/);

			await page.goto(termsAcceptPageUrl);

			// check sign in has worked first
			await expect(page).toHaveURL(new RegExp(JOBS_TOS_URI));
			// check session cookie is set
			const cookies = await page.context().cookies();
			const idxCookie = cookies.find((c) => c.name === 'idx');
			expect(idxCookie).toBeDefined();
			// check idapi cookies are set
			const guUCookie = cookies.find((c) => c.name === 'GU_U');
			expect(guUCookie).toBeDefined();

			await expect(page.getByText('Welcome to Guardian Jobs')).toBeVisible();

			// User should have their original first/last name and not be a jobs user yet.
			const user = await getTestOktaUser(request, emailAddress);
			expect(user.status).toEqual('ACTIVE');
			const { firstName, lastName, isJobsUser } = user.profile;
			await expect(page.locator('input[name=firstName]')).toHaveValue(
				firstName || '',
			);
			await expect(page.locator('input[name=secondName]')).toHaveValue(
				lastName || '',
			);
			expect(isJobsUser).toEqual(false);

			await page.locator('input[name=firstName]').clear();
			await page.locator('input[name=firstName]').fill('First Name');
			await page.locator('input[name=secondName]').clear();
			await page.locator('input[name=secondName]').fill('Second Name');

			await page.getByRole('button', { name: 'Continue' }).click();

			// Make sure the returnURL is respected.
			await expect(page).toHaveURL(/https:\/\/jobs\.theguardian\.com\//);

			// User should have `isJobsUser` set to true and their First/Last name set.
			const updatedUser = await getTestOktaUser(request, emailAddress);
			expect(updatedUser.status).toEqual('ACTIVE');
			expect(updatedUser.profile.firstName).toEqual('First Name');
			expect(updatedUser.profile.lastName).toEqual('Second Name');
			expect(updatedUser.profile.isJobsUser).toEqual(true);
		});
	});
});
