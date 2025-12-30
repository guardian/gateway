import { test, expect, Page } from '@playwright/test';
import { randomPassword, createTestUser } from '../../helpers/api/idapi';
import { checkForEmailAndGetDetails } from '../../helpers/api/mailosaur';
import { mockClientRecaptcha } from '../../helpers/network/recaptcha';

test.describe('Delete my account flow in Okta', () => {
	const signInAndVisitDeletePage = async (
		page: Page,
		email: string,
		password: string,
	) => {
		await page.goto(
			`/signin?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/review`,
			)}&usePasswordSignIn=true`,
		);
		await page.locator('input[name=email]').fill(email);
		await page.locator('input[name=password]').fill(password);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/review/);

		await page.goto(`/delete`);
	};

	test.beforeEach(async ({ page }) => {
		await mockClientRecaptcha(page);
	});

	test('successfully deletes a user account', async ({ request, page }) => {
		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await signInAndVisitDeletePage(page, emailAddress, finalPassword);
		// then try to delete the account
		await page.getByText('I have created an account by accident').click();
		await page.locator('input[name=password]').fill(finalPassword);
		await page.getByRole('button', { name: 'Delete your account' }).click();

		await expect(page).toHaveURL(/\/delete\/complete/);
		await expect(page.getByText('Account deleted')).toBeVisible();
		await expect(
			page.getByRole('link', { name: 'Return to the Guardian' }),
		).toBeVisible();
	});

	test('shows an error when the password is incorrect', async ({
		request,
		page,
	}) => {
		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await signInAndVisitDeletePage(page, emailAddress, finalPassword);
		// then try to delete the account, but with the wrong password
		await page.getByText('I have created an account by accident').click();
		await page.locator('input[name=password]').fill('wrong-password');
		await page.locator('[data-cy="main-form-submit-button"]').click();

		await expect(page).toHaveURL(/\/delete/);
		await expect(page.getByText('Password is incorrect')).toBeVisible();

		// then try to delete the account properly this time
		await page.getByText('I have created an account by accident').click();
		await page.locator('input[name=password]').fill(finalPassword);
		await page.locator('[data-cy="main-form-submit-button"]').click();

		await expect(page).toHaveURL(/\/delete\/complete/);
		await expect(page.getByText('Account deleted')).toBeVisible();
		await expect(
			page.getByRole('link', { name: 'Return to the Guardian' }),
		).toBeVisible();
	});

	test('should block user from deleting account if they have a digital pack', async ({
		request,
		page,
		context,
	}) => {
		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await context.addCookies([
			{
				name: 'cypress-mock-state',
				value: 'digitalPack',
				domain: 'profile.thegulocal.com',
				path: '/',
			},
		]);

		await signInAndVisitDeletePage(page, emailAddress, finalPassword);

		// then try to delete the account but get blocked
		await expect(
			page.getByText('You have an active Digital Pack subscription'),
		).toBeVisible();
	});

	test('should block user from deleting account if they have a paper subscription', async ({
		request,
		page,
		context,
	}) => {
		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await context.addCookies([
			{
				name: 'cypress-mock-state',
				value: 'paperSubscriber',
				domain: 'profile.thegulocal.com',
				path: '/',
			},
		]);

		await signInAndVisitDeletePage(page, emailAddress, finalPassword);

		// then try to delete the account but get blocked
		await expect(
			page.getByText(
				'You have an active print subscription to one of our newspapers',
			),
		).toBeVisible();
	});

	test('should block user from deleting account if they have a guardian weekly subscription', async ({
		request,
		page,
		context,
	}) => {
		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await context.addCookies([
			{
				name: 'cypress-mock-state',
				value: 'guardianWeeklySubscriber',
				domain: 'profile.thegulocal.com',
				path: '/',
			},
		]);

		await signInAndVisitDeletePage(page, emailAddress, finalPassword);

		// then try to delete the account but get blocked
		await expect(
			page.getByText(
				'You have an active print subscription to the Guardian Weekly',
			),
		).toBeVisible();
	});

	test('should block user from deleting account if they have a feast subscription', async ({
		request,
		page,
		context,
	}) => {
		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await context.addCookies([
			{
				name: 'cypress-mock-state',
				value: 'feast',
				domain: 'profile.thegulocal.com',
				path: '/',
			},
		]);

		await signInAndVisitDeletePage(page, emailAddress, finalPassword);

		// then try to delete the account but get blocked
		await expect(
			page.getByText(
				'You have an active subscription to the Guardian Feast app',
			),
		).toBeVisible();
	});

	test('should block user from deleting account if they are a recurring contributor', async ({
		request,
		page,
		context,
	}) => {
		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await context.addCookies([
			{
				name: 'cypress-mock-state',
				value: 'recurringContributor',
				domain: 'profile.thegulocal.com',
				path: '/',
			},
		]);

		await signInAndVisitDeletePage(page, emailAddress, finalPassword);

		// then try to delete the account but get blocked
		await expect(
			page.getByText('You have a recurring contribution'),
		).toBeVisible();
	});

	test('should block user from deleting account if they are a member', async ({
		request,
		page,
		context,
	}) => {
		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await context.addCookies([
			{
				name: 'cypress-mock-state',
				value: 'member',
				domain: 'profile.thegulocal.com',
				path: '/',
			},
		]);

		await signInAndVisitDeletePage(page, emailAddress, finalPassword);

		// then try to delete the account but get blocked
		await expect(
			page.getByText("We've noticed you have an active membership"),
		).toBeVisible();
	});

	test('should block user from deleting account if they are a paid member', async ({
		request,
		page,
		context,
	}) => {
		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await context.addCookies([
			{
				name: 'cypress-mock-state',
				value: 'paidMember',
				domain: 'profile.thegulocal.com',
				path: '/',
			},
		]);

		await signInAndVisitDeletePage(page, emailAddress, finalPassword);

		// then try to delete the account but get blocked
		await expect(
			page.getByText("We've noticed you have an active membership"),
		).toBeVisible();
	});

	test('should show the email validation page if the user does not have a validated email address', async ({
		request,
		page,
		context,
	}) => {
		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		// set the mock state cookie
		await context.addCookies([
			{
				name: 'cypress-mock-state',
				value: 'unvalidatedEmail',
				domain: 'profile.thegulocal.com',
				path: '/',
			},
		]);

		await signInAndVisitDeletePage(page, emailAddress, finalPassword);

		// then try to delete the account but get blocked
		await expect(
			page.getByText(
				'Before you can delete your account you need to validate your email address.',
			),
		).toBeVisible();

		const timeRequestWasMade = new Date();

		await page.getByText('Send validation email').click();

		const { body, codes } = await checkForEmailAndGetDetails(
			emailAddress,
			timeRequestWasMade,
		);

		// email
		expect(body).toContain('Your one-time passcode');
		expect(codes?.length).toEqual(1);
		const code = codes?.[0].value;
		expect(code).toMatch(/^\d{6}$/);

		// passcode page
		await expect(page).toHaveURL(/\/reset-password\/email-sent/);
		await expect(page.getByText('Enter your one-time code')).toBeVisible();
		await expect(page.getByText('Submit one-time code')).toBeVisible();

		await page.locator('input[name=code]').clear();
		await page.locator('input[name=code]').fill(code!);

		await expect(page).toHaveURL(/\/reset-password\/password/);

		await page.locator('input[name="password"]').fill(randomPassword());
		await page.locator('button[type="submit"]').click();

		await expect(page).toHaveURL(/\/reset-password\/complete/);
		await context.clearCookies({ name: 'cypress-mock-state' });
		await page.getByText('Continue to the Guardian').click();
		await expect(page).toHaveURL(/\/delete/);
	});

	test('should show the email validation page if the user does not have a password set', async ({
		request,
		page,
		context,
	}) => {
		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await context.addCookies([
			{
				name: 'cypress-mock-state',
				value: 'noPassword',
				domain: 'profile.thegulocal.com',
				path: '/',
			},
		]);

		await signInAndVisitDeletePage(page, emailAddress, finalPassword);

		// then try to delete the account but get blocked
		await expect(
			page.getByText(
				'Before you can delete your account you need to set a password for your account.',
			),
		).toBeVisible();
		const timeRequestWasMade = new Date();

		await page.getByText('Set password').click();

		const { body, codes } = await checkForEmailAndGetDetails(
			emailAddress,
			timeRequestWasMade,
		);

		// email
		expect(body).toContain('Your one-time passcode');
		expect(codes?.length).toEqual(1);
		const code = codes?.[0].value;
		expect(code).toMatch(/^\d{6}$/);

		// passcode page
		await expect(page).toHaveURL(/\/reset-password\/email-sent/);
		await expect(page.getByText('Enter your one-time code')).toBeVisible();
		await expect(page.getByText('Submit one-time code')).toBeVisible();

		await page.locator('input[name=code]').clear();
		await page.locator('input[name=code]').fill(code!);

		await expect(page).toHaveURL(/\/reset-password\/password/);

		await page.locator('input[name="password"]').fill(randomPassword());
		await page.locator('button[type="submit"]').click();

		await expect(page).toHaveURL(/\/reset-password\/complete/);
		await context.clearCookies({ name: 'cypress-mock-state' });
		await page.getByText('Continue to the Guardian').click();
		await expect(page).toHaveURL(/\/delete/);
	});
});
