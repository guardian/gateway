import { Page, APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';
import { checkForEmailAndGetDetails } from './mailosaur';
import { getTestOktaUser } from './okta';

interface SendEmailAndValidatePasscodeOptions {
	page: Page;
	request: APIRequestContext;
	emailAddress: string;
	expectedReturnUrl?: string;
	params?: string;
	expectedEmailBody?: 'Your one-time passcode' | 'Your verification code';
	additionalTests?:
		| 'passcode-incorrect'
		| 'resend-email'
		| 'change-email'
		| 'from-uri';
}

export async function sendEmailAndValidatePasscode({
	page,
	request,
	emailAddress,
	expectedReturnUrl = 'https://m.code.dev-theguardian.com/',
	params,
	expectedEmailBody = 'Your one-time passcode',
	additionalTests,
}: SendEmailAndValidatePasscodeOptions) {
	// Set the mock state cookie for passcode send again timer
	await page.context().addCookies([
		{
			name: 'cypress-mock-state',
			value: '1',
			domain: 'profile.thegulocal.com',
			path: '/',
		},
	]);

	await page.goto(`/signin?${params ? `${params}` : ''}`);
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
	expect(codes?.length).toEqual(1);
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

			const { body: body2, codes: codes2 } = await checkForEmailAndGetDetails(
				emailAddress,
				timeRequestWasMade2,
			);

			// email
			expect(body2).toContain(expectedEmailBody);
			expect(codes2?.length).toEqual(1);
			const code2 = codes2?.[0].value;
			expect(code2).toMatch(/^\d{6}$/);

			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await page.locator('input[name=code]').fill(code2!);

			await expect(page).toHaveURL(new RegExp(expectedReturnUrl));

			const user = await getTestOktaUser(request, emailAddress);
			expect(user.status).toEqual('ACTIVE');
			expect(user.profile.emailValidated).toEqual(true);
			break;
		}
		case 'change-email':
			await page.getByText('try another address').click();
			await expect(page).toHaveURL(/\/signin/);
			break;
		case 'passcode-incorrect': {
			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await page.locator('input[name=code]').fill(`${+code! + 1}`);

			await expect(page).toHaveURL(/\/passcode/);

			await expect(page.getByText('Incorrect code')).toBeVisible();
			await page.locator('input[name=code]').clear();
			await page.locator('input[name=code]').fill(code!);

			await page.getByText('Submit verification code').click();

			await expect(page).toHaveURL(/\/welcome\/existing/);
			await page.getByText('Return to the Guardian').click();

			await expect(page).toHaveURL(new RegExp(expectedReturnUrl));

			const user1 = await getTestOktaUser(request, emailAddress);
			expect(user1.status).toEqual('ACTIVE');
			expect(user1.profile.emailValidated).toEqual(true);
			break;
		}
		case 'from-uri': {
			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await page.locator('input[name=code]').fill(code!);

			await expect(page).toHaveURL(new RegExp(expectedReturnUrl));

			const user2 = await getTestOktaUser(request, emailAddress);
			expect(user2.status).toEqual('ACTIVE');
			expect(user2.profile.emailValidated).toEqual(true);
			break;
		}
		default: {
			await expect(page.getByText('Enter your one-time code')).toBeVisible();
			await page.locator('input[name=code]').fill(code!);

			await expect(page).toHaveURL(/welcome\/existing/);

			await page
				.locator('a')
				.filter({ hasText: 'Return to the Guardian' })
				.click();
			await expect(page).toHaveURL(new RegExp(expectedReturnUrl));

			const user3 = await getTestOktaUser(request, emailAddress);
			expect(user3.status).toEqual('ACTIVE');
			expect(user3.profile.emailValidated).toEqual(true);
		}
	}
}
