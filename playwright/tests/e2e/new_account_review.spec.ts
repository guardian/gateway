import { test, expect } from '@playwright/test';
import { randomMailosaurEmail } from '../../helpers/api/idapi';
import { checkForEmailAndGetDetails } from '../../helpers/api/mailosaur';

test.describe('New account newsletters page', () => {
	test.beforeEach(async ({ page }) => {
		await page.route('https://m.code.dev-theguardian.com/**', async (route) => {
			await route.fulfill({ status: 200 });
		});
	});

	test('should not redirect to the newsletters page if the geolocation is UK/EU', async ({
		page,
	}) => {
		// We test that the GB geolocation flow works as expected in the tests above
		// because they set the geolocation mock cookie to GB, and don't expect a redirect
		// to the newsletters page, so here we just check an EU geolocation.
		const encodedReturnUrl =
			'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
		const unregisteredEmail = randomMailosaurEmail();

		await page.context().addCookies([
			{
				name: 'cypress-mock-state',
				value: 'FR',
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
		).not.toBeVisible();
		await expect(page).toHaveURL(
			new RegExp(decodeURIComponent(encodedReturnUrl)),
		);
	});

	[{ region: 'AU' }, { region: 'US' }].forEach(({ region }) => {
		test(`should redirect to the newsletters page if the geolocation is ${region}`, async ({
			page,
		}) => {
			const encodedReturnUrl =
				'https%3A%2F%2Fm.code.dev-theguardian.com%2Ftravel%2F2019%2Fdec%2F18%2Ffood-culture-tour-bethlehem-palestine-east-jerusalem-photo-essay';
			const unregisteredEmail = randomMailosaurEmail();

			await page.context().addCookies([
				{
					name: 'cypress-mock-state',
					value: region,
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
			await expect(page).toHaveURL(/\/welcome\/newsletters/);
			await expect(
				page.getByText(
					'Our newsletters help you get closer to our quality, independent journalism.',
				),
			).toBeVisible();
			await page.locator('button[type="submit"]').click();
			await expect(page).toHaveURL(
				new RegExp(decodeURIComponent(encodedReturnUrl)),
			);
			await page.context().clearCookies({ name: 'cypress-mock-state' });
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

		// consents page
		await expect(page).toHaveURL(/\/welcome\/review/);
		await page.getByRole('link', { name: 'Continue' }).click();

		// jobs T&C page
		await expect(page).toHaveURL(/\/agree\/GRS/);
		await expect(
			page.getByText(
				'Click ‘continue’ to automatically use your existing Guardian account to sign in with Guardian Jobs',
			),
		).toBeVisible();

		await page.locator('input[name=firstName]').fill(id!);
		await page.locator('input[name=secondName]').fill(id!);
		await page.locator('button[type="submit"]').click();

		// jobs.theguardian.com
		await expect(page).toHaveURL(/https:\/\/jobs\.theguardian\.com\//);
	});
});
