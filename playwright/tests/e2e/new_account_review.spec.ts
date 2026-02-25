import { test, expect } from '@playwright/test';
import { randomMailosaurEmail } from '../../helpers/api/idapi';
import { checkForEmailAndGetDetails } from '../../helpers/api/mailosaur';
import { JOBS_TOS_URI } from '@/shared/model/Configuration';
import { escapeRegExp } from '../../helpers/utils';

test.describe('New account newsletters page', () => {
	test.beforeEach(async ({ page }) => {
		await page.route('https://m.code.dev-theguardian.com/**', async (route) => {
			await route.fulfill({ status: 200 });
		});
	});

	['GB', 'FR', 'AU', 'US'].forEach((geoLocation) => {
		test(`should redirect to the newsletters page if the geolocation is ${geoLocation}`, async ({
			page,
		}) => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();

			await page.context().addCookies([
				{
					name: 'playwright-mock-state',
					value: geoLocation,
					domain: process.env.BASE_URI,
					path: '/',
				},
			]);

			await page.goto(`/register/email?returnUrl=${encodedReturnUrl}`);

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

			await expect(page).toHaveURL(/\/welcome\/review/);
			await page.getByRole('link', { name: 'Continue' }).click();
			await expect(
				page.getByText(
					'Our newsletters help you get closer to our quality, independent journalism.',
				),
			).toBeVisible();
			await page.locator('button[type="submit"]').click();
			await expect(page).toHaveURL(
				new RegExp(escapeRegExp(decodeURIComponent(encodedReturnUrl))),
			);
		});
	});

	test('should redirect to the Jobs T&C page if client is Jobs', async ({
		page,
	}) => {
		await page.route('https://jobs.theguardian.com/', async (route) => {
			await route.fulfill({ status: 200 });
		});

		const encodedReturnUrl =
			'https%3A%2F%2Fjobs.theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
		const unregisteredEmail = randomMailosaurEmail();

		await page.goto(
			`/register/email?returnUrl=${encodedReturnUrl}&clientId=jobs`,
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

		// jobs.theguardian.com
		await expect(page).toHaveURL(/https:\/\/jobs\.theguardian\.com\//);
	});
});
