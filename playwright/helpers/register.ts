import { expect, Page, APIRequestContext } from '@playwright/test';
import { checkForEmailAndGetDetails } from './api/mailosaur';
import { escapeRegExp } from './utils';
import { getTestOktaUser } from './api/okta';

export const existingUserSendEmailAndValidatePasscode = async ({
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
