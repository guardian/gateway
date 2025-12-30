import { test, expect } from '@playwright/test';
import { createTestUser } from '../../helpers/api/idapi';
import { oktaGetApps } from '../../helpers/api/okta-apps';

// Newsletter descriptions
const RegistrationNewsletterDescriptions = {
	saturdayEdition:
		'An exclusive email highlighting the week’s best Guardian journalism from the editor-in-chief, Katharine Viner.',
	auBundle:
		"Get an exclusive, curated view of the week's best Guardian journalism from around the world by editor-in-chief Katharine Viner, and the local view from Guardian Australia editor Lenore Taylor.",
	usBundle:
		"Get an exclusive, curated view of the week's best Guardian journalism from editor-in-chief Katharine Viner and more on the latest news from the US.",
};

// Geolocation codes
const GEOLOCATION_CODES = {
	GB: 'GB',
	EUROPE: 'FR',
	AMERICA: 'US',
	AUSTRALIA: 'AU',
	OTHERS: 'ROW',
};

test.describe('Saturday Edition Geolocation', () => {
	test('should show the Saturday Edition newsletter for GB', async ({
		request,
		page,
	}) => {
		// Intercept the geolocation header and set it to GB to show Saturday Edition.
		await page.route(`https://${process.env.BASE_URI}/**/*`, async (route) => {
			const headers = {
				...route.request().headers(),
				'x-gu-geolocation': GEOLOCATION_CODES.GB,
			};
			await route.continue({ headers });
		});
		await page.goto(`/register/email`);
		await expect(page.getByText('Saturday Edition')).toBeVisible();
		await expect(
			page.getByText(RegistrationNewsletterDescriptions.saturdayEdition),
		).toBeVisible();

		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await page.goto(
			`/signin?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/google`,
			)}&usePasswordSignIn=true`,
		);
		await page.locator('input[name=email]').fill(emailAddress);
		await page.locator('input[name=password]').fill(finalPassword);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/google/);
		await expect(page.getByText('Saturday Edition')).toBeVisible();
		await expect(
			page.getByText(RegistrationNewsletterDescriptions.saturdayEdition),
		).toBeVisible();
	});

	test('should show the Saturday Edition newsletter for EU', async ({
		request,
		page,
	}) => {
		// Intercept the geolocation header and set it to FR to show Saturday Edition.
		await page.route(`https://${process.env.BASE_URI}/**/*`, async (route) => {
			const headers = {
				...route.request().headers(),
				'x-gu-geolocation': GEOLOCATION_CODES.EUROPE,
			};
			await route.continue({ headers });
		});
		await page.goto(`/register/email`);
		await expect(page.getByText('Saturday Edition')).toBeVisible();
		await expect(
			page.getByText(RegistrationNewsletterDescriptions.saturdayEdition),
		).toBeVisible();

		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await page.goto(
			`/signin?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/google`,
			)}&usePasswordSignIn=true`,
		);
		await page.locator('input[name=email]').fill(emailAddress);
		await page.locator('input[name=password]').fill(finalPassword);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/google/);
		await expect(page.getByText('Saturday Edition')).toBeVisible();
		await expect(
			page.getByText(RegistrationNewsletterDescriptions.saturdayEdition),
		).toBeVisible();
	});

	test('should show the Saturday Edition newsletter for ROW', async ({
		request,
		page,
	}) => {
		// Intercept the geolocation header and set it to ROW to show Saturday Edition.
		await page.route(`https://${process.env.BASE_URI}/**/*`, async (route) => {
			const headers = {
				...route.request().headers(),
				'x-gu-geolocation': GEOLOCATION_CODES.OTHERS,
			};
			await route.continue({ headers });
		});
		await page.goto(`/register/email`);
		await expect(page.getByText('Saturday Edition')).toBeVisible();
		await expect(
			page.getByText(RegistrationNewsletterDescriptions.saturdayEdition),
		).toBeVisible();

		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await page.goto(
			`/signin?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/google`,
			)}&usePasswordSignIn=true`,
		);
		await page.locator('input[name=email]').fill(emailAddress);
		await page.locator('input[name=password]').fill(finalPassword);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/google/);
		await expect(page.getByText('Saturday Edition')).toBeVisible();
		await expect(
			page.getByText(RegistrationNewsletterDescriptions.saturdayEdition),
		).toBeVisible();
	});

	test('should show the US bundle for US', async ({ request, page }) => {
		// Intercept the geolocation header and set it to US to show US bundle.
		await page.route(`https://${process.env.BASE_URI}/**/*`, async (route) => {
			const headers = {
				...route.request().headers(),
				'x-gu-geolocation': GEOLOCATION_CODES.AMERICA,
			};
			await route.continue({ headers });
		});
		await page.goto(`/register/email`);
		await expect(page.getByText('Saturday Edition')).not.toBeVisible();
		await expect(page.getByText('Weekend newsletters')).toBeVisible();
		await expect(
			page.getByText(RegistrationNewsletterDescriptions.usBundle),
		).toBeVisible();

		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await page.goto(
			`/signin?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/google`,
			)}&usePasswordSignIn=true`,
		);
		await page.locator('input[name=email]').fill(emailAddress);
		await page.locator('input[name=password]').fill(finalPassword);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/google/);
		await expect(page.getByText('Saturday Edition')).not.toBeVisible();
		await expect(page.getByText('Weekend newsletters')).toBeVisible();
		await expect(
			page.getByText(RegistrationNewsletterDescriptions.usBundle),
		).toBeVisible();
	});

	test('should show the AU bundle for AU', async ({ request, page }) => {
		// Intercept the geolocation header and set it to AU to show AU bundle.
		await page.route(`https://${process.env.BASE_URI}/**/*`, async (route) => {
			const headers = {
				...route.request().headers(),
				'x-gu-geolocation': GEOLOCATION_CODES.AUSTRALIA,
			};
			await route.continue({ headers });
		});
		await page.goto(`/register/email`);
		await expect(page.getByText('Saturday Edition')).not.toBeVisible();
		await expect(page.getByText('Saturday newsletters')).toBeVisible();
		await expect(
			page.getByText(RegistrationNewsletterDescriptions.auBundle),
		).toBeVisible();

		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await page.goto(
			`/signin?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/google`,
			)}&usePasswordSignIn=true`,
		);
		await page.locator('input[name=email]').fill(emailAddress);
		await page.locator('input[name=password]').fill(finalPassword);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/google/);
		await expect(page.getByText('Saturday Edition')).not.toBeVisible();
		await expect(page.getByText('Saturday newsletters')).toBeVisible();
		await expect(
			page.getByText(RegistrationNewsletterDescriptions.auBundle),
		).toBeVisible();
	});
});

test.describe('Feast newsletter for Feast app', () => {
	test('should show the Feast newsletter if coming from feast ios', async ({
		request,
		page,
	}) => {
		const apps = await oktaGetApps(request, 'ios_feast_app');
		const app = apps[0];

		await page.goto(`/register/email?appClientId=${app.id}`);
		await expect(page.getByText('Feast newsletter')).toBeVisible();
		await expect(page.getByText('Saturday Edition')).not.toBeVisible();
		await expect(page.getByText('Weekend newsletters')).not.toBeVisible();
		await expect(page.getByText('Saturday newsletters')).not.toBeVisible();

		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await page.goto(
			`/signin?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/google?appClientId=${app.id}`,
			)}&usePasswordSignIn=true`,
		);
		await page.locator('input[name=email]').fill(emailAddress);
		await page.locator('input[name=password]').fill(finalPassword);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/google/);
		await expect(page.getByText('Feast newsletter')).toBeVisible();
		await expect(page.getByText('Saturday Edition')).not.toBeVisible();
		await expect(page.getByText('Weekend newsletters')).not.toBeVisible();
		await expect(page.getByText('Saturday newsletters')).not.toBeVisible();
	});

	test('should show the Feast newsletter if coming from feast android', async ({
		request,
		page,
	}) => {
		const apps = await oktaGetApps(request, 'android_feast_app');
		const app = apps[0];

		await page.goto(`/register/email?appClientId=${app.id}`);
		await expect(page.getByText('Feast newsletter')).toBeVisible();
		await expect(page.getByText('Saturday Edition')).not.toBeVisible();
		await expect(page.getByText('Weekend newsletters')).not.toBeVisible();
		await expect(page.getByText('Saturday newsletters')).not.toBeVisible();

		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await page.goto(
			`/signin?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/google?appClientId=${app.id}`,
			)}&usePasswordSignIn=true`,
		);
		await page.locator('input[name=email]').fill(emailAddress);
		await page.locator('input[name=password]').fill(finalPassword);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/google/);
		await expect(page.getByText('Feast newsletter')).toBeVisible();
		await expect(page.getByText('Saturday Edition')).not.toBeVisible();
		await expect(page.getByText('Weekend newsletters')).not.toBeVisible();
		await expect(page.getByText('Saturday newsletters')).not.toBeVisible();
	});
});

test.describe('Jobs newsletter for Jobs Site', () => {
	test('should show the Jobs newsletter and Saturday Edition newsletter if coming from Jobs site', async ({
		request,
		page,
	}) => {
		const clientId = 'jobs';
		await page.goto(`/register/email?clientId=${clientId}`);
		await expect(page.getByText('Guardian Jobs newsletter')).toBeVisible();
		await expect(page.getByText('Saturday Edition newsletter')).toBeVisible();
		await expect(page.getByText('Weekend newsletters')).not.toBeVisible();
		await expect(page.getByText('Saturday newsletters')).not.toBeVisible();

		const { emailAddress, finalPassword } = await createTestUser(request, {
			isUserEmailValidated: true,
		});

		await page.goto(
			`/signin?returnUrl=${encodeURIComponent(
				`https://${process.env.BASE_URI}/welcome/google?clientId=${clientId}`,
			)}&usePasswordSignIn=true`,
		);
		await page.locator('input[name=email]').fill(emailAddress);
		await page.locator('input[name=password]').fill(finalPassword);
		await page.locator('[data-cy="main-form-submit-button"]').click();
		await expect(page).toHaveURL(/\/welcome\/google/);
		await expect(page.getByText('Guardian Jobs newsletter')).toBeVisible();
		await expect(page.getByText('Saturday Edition newsletter')).toBeVisible();
		await expect(page.getByText('Weekend newsletters')).not.toBeVisible();
		await expect(page.getByText('Saturday newsletters')).not.toBeVisible();
	});
});
