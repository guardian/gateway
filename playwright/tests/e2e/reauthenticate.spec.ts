import { test, expect } from '@playwright/test';
import { createTestUser } from '../../helpers/api/idapi';
import { checkForEmailAndGetDetails } from '../../helpers/api/mailosaur';
import { getCurrentOktaSession } from '../../helpers/api/okta';

test.describe('Reauthenticate flow, Okta enabled, password default', () => {
	test('keeps User A signed in when User A attempts to reauthenticate', async ({
		request,
		page,
	}) => {
		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		// First, sign in
		await page.goto(
			`/signin?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/review`,
			)}&usePasswordSignIn=true`,
		);
		await page.locator('input[name=email]').fill(emailAddress);
		await page.locator('input[name=password]').fill(finalPassword);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/review/);

		// Then, try to reauthenticate
		await page.goto(
			`/reauthenticate?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/review`,
			)}&usePasswordSignIn=true`,
		);
		await page.locator('input[name=email]').fill(emailAddress);
		await page.locator('input[name=password]').fill(finalPassword);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/review/);

		// Get the current session data
		const cookies = await page.context().cookies();
		const idxCookie = cookies.find((c) => c.name === 'idx');
		expect(idxCookie).toBeDefined();
		if (idxCookie) {
			const session = await getCurrentOktaSession(request, {
				idx: idxCookie.value,
			});
			expect(session.login).toBe(emailAddress);
		}
	});

	test('signs in User B when User B attempts to reauthenticate while User A is logged in', async ({
		request,
		page,
	}) => {
		// Create User A
		const { emailAddress: emailAddressA, finalPassword: finalPasswordA } =
			await createTestUser(request, { isUserEmailValidated: true });

		// First, sign in as User A
		await page.goto(
			`/signin?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/review`,
			)}&usePasswordSignIn=true`,
		);
		await page.locator('input[name=email]').fill(emailAddressA);
		await page.locator('input[name=password]').fill(finalPasswordA);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/review/);

		// Create User B
		const { emailAddress: emailAddressB, finalPassword: finalPasswordB } =
			await createTestUser(request, { isUserEmailValidated: true });

		// Then, try to reauthenticate as User B
		await page.goto(
			`/reauthenticate?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/review`,
			)}&usePasswordSignIn=true`,
		);
		await page.locator('input[name=email]').fill(emailAddressB);
		await page.locator('input[name=password]').fill(finalPasswordB);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/review/);

		// Get the current session data
		const cookies = await page.context().cookies();
		const idxCookie = cookies.find((c) => c.name === 'idx');
		expect(idxCookie).toBeDefined();
		if (idxCookie) {
			const session = await getCurrentOktaSession(request, {
				idx: idxCookie.value,
			});
			expect(session.login).toBe(emailAddressB);
		}
	});
});

test.describe('Reauthenticate flow, Okta enabled, passcode default', () => {
	test('keeps User A signed in when User A attempts to reauthenticate - with password', async ({
		request,
		page,
	}) => {
		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		// First, sign in
		await page.goto(
			`/signin/password?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/review`,
			)}`,
		);
		await page.locator('input[name=email]').fill(emailAddress);
		await page.locator('input[name=password]').fill(finalPassword);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/review/);

		// Then, try to reauthenticate
		await page.goto(
			`/reauthenticate?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/review`,
			)}`,
		);
		await page.getByText('Sign in with a password instead').click();
		await page.locator('input[name=email]').fill(emailAddress);
		await page.locator('input[name=password]').fill(finalPassword);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/review/);

		// Get the current session data
		const cookies = await page.context().cookies();
		const idxCookie = cookies.find((c) => c.name === 'idx');
		expect(idxCookie).toBeDefined();
		if (idxCookie) {
			const session = await getCurrentOktaSession(request, {
				idx: idxCookie.value,
			});
			expect(session.login).toBe(emailAddress);
		}
	});

	test('keeps User A signed in when User A attempts to reauthenticate - with passcode', async ({
		request,
		page,
	}) => {
		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		// First, sign in
		await page.goto(
			`/signin/password?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/review`,
			)}`,
		);
		await page.locator('input[name=email]').fill(emailAddress);
		await page.locator('input[name=password]').fill(finalPassword);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/review/);

		// Then, try to reauthenticate
		await page.goto(
			`/reauthenticate?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/review`,
			)}`,
		);
		await page.locator('input[name=email]').fill(emailAddress);
		const timeRequestWasMade = new Date();
		await page.locator('[data-cy="main-form-submit-button"]').click();

		const { codes } = await checkForEmailAndGetDetails(
			emailAddress,
			timeRequestWasMade,
		);

		// email
		expect(codes?.length).toBe(1);
		const code = codes?.[0].value;
		expect(code).toMatch(/^\d{6}$/);

		// passcode page
		await expect(page).toHaveURL(/\/passcode/);
		await expect(page.getByText('Enter your one-time code')).toBeVisible();
		await expect(page.getByText('Submit verification code')).toBeVisible();
		await page.locator('input[name=code]').fill(code!);

		await expect(page).toHaveURL(/\/welcome\/review/);

		// Get the current session data
		const cookies = await page.context().cookies();
		const idxCookie = cookies.find((c) => c.name === 'idx');
		expect(idxCookie).toBeDefined();
		if (idxCookie) {
			const session = await getCurrentOktaSession(request, {
				idx: idxCookie.value,
			});
			expect(session.login).toBe(emailAddress);
		}
	});

	test('signs in User B when User B attempts to reauthenticate while User A is logged in - with password', async ({
		request,
		page,
	}) => {
		// Create User A
		const { emailAddress: emailAddressA, finalPassword: finalPasswordA } =
			await createTestUser(request, { isUserEmailValidated: true });

		// First, sign in as User A
		await page.goto(
			`/signin/password?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/review`,
			)}`,
		);
		await page.locator('input[name=email]').fill(emailAddressA);
		await page.locator('input[name=password]').fill(finalPasswordA);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/review/);

		// Create User B
		const { emailAddress: emailAddressB, finalPassword: finalPasswordB } =
			await createTestUser(request, { isUserEmailValidated: true });

		// Then, try to reauthenticate as User B
		await page.goto(
			`/reauthenticate?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/review`,
			)}`,
		);
		await page.getByText('Sign in with a password instead').click();
		await page.locator('input[name=email]').fill(emailAddressB);
		await page.locator('input[name=password]').fill(finalPasswordB);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/review/);

		// Get the current session data
		const cookies = await page.context().cookies();
		const idxCookie = cookies.find((c) => c.name === 'idx');
		expect(idxCookie).toBeDefined();
		if (idxCookie) {
			const session = await getCurrentOktaSession(request, {
				idx: idxCookie.value,
			});
			expect(session.login).toBe(emailAddressB);
		}
	});

	test('signs in User B when User B attempts to reauthenticate while User A is logged in - with passcode', async ({
		request,
		page,
	}) => {
		// Create User A
		const { emailAddress: emailAddressA, finalPassword: finalPasswordA } =
			await createTestUser(request, { isUserEmailValidated: true });

		// First, sign in as User A
		await page.goto(
			`/signin/password?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/review`,
			)}`,
		);
		await page.locator('input[name=email]').fill(emailAddressA);
		await page.locator('input[name=password]').fill(finalPasswordA);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/review/);

		// Create User B
		const { emailAddress: emailAddressB } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		// Then, try to reauthenticate as User B
		await page.goto(
			`/reauthenticate?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/review`,
			)}`,
		);
		await page.locator('input[name=email]').fill(emailAddressB);
		const timeRequestWasMade = new Date();
		await page.locator('[data-cy="main-form-submit-button"]').click();

		const { codes } = await checkForEmailAndGetDetails(
			emailAddressB,
			timeRequestWasMade,
		);

		// email
		expect(codes?.length).toBe(1);
		const code = codes?.[0].value;
		expect(code).toMatch(/^\d{6}$/);

		// passcode page
		await expect(page).toHaveURL(/\/passcode/);
		await expect(page.getByText('Enter your one-time code')).toBeVisible();
		await expect(page.getByText('Submit verification code')).toBeVisible();
		await page.locator('input[name=code]').fill(code!);

		await expect(page).toHaveURL(/\/welcome\/review/);

		// Get the current session data
		const cookies = await page.context().cookies();
		const idxCookie = cookies.find((c) => c.name === 'idx');
		expect(idxCookie).toBeDefined();
		if (idxCookie) {
			const session = await getCurrentOktaSession(request, {
				idx: idxCookie.value,
			});
			expect(session.login).toBe(emailAddressB);
		}
	});
});
