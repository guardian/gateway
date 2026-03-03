import { expect } from '@playwright/test';
import { test } from '../../fixtures/mockedApiRequest';
import { injectAndCheckAxe } from '../../helpers/accessibility';

test.describe('Unsubscribe newsletter/marketing email', () => {
	test.beforeEach(async ({ mockApi }) => {
		await mockApi.get('/mock/purge');
	});

	test.describe('a11y checks', () => {
		test('Has no detectable a11y violations on unsubscribe complete page', async ({
			mockApi,
			page,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/unsubscribe',
					status: 200,
					body: {},
				},
			});
			await page.goto(
				'/unsubscribe/newsletter/pushing-buttons%3A1000000%3A1677075570/token',
			);
			await injectAndCheckAxe(page);
			await expect(
				page.getByText(
					'Please click below to complete your unsubscribe from this list',
				),
			).toBeVisible();

			await mockApi.post('/mock/permanent', {
				data: {
					path: '/unsubscribe',
					status: 200,
					body: {},
				},
			});

			await page.locator('button[type="submit"]').click();

			await expect(page.getByText('You have been unsubscribed')).toBeVisible();
		});

		test('Has no detectable a11y violations on unsubscribe error page', async ({
			mockApi,
			page,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/unsubscribe',
					status: 400,
					body: {},
				},
			});
			await page.goto(
				'/unsubscribe/newsletter/pushing-buttons%3A1000000%3A1677075570/token',
			);
			await injectAndCheckAxe(page);
		});
	});

	test.describe('unsubscribe flow', () => {
		test('should be able to unsubscribe from a newsletter', async ({
			mockApi,
			page,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/unsubscribe',
					status: 200,
					body: {},
				},
			});
			await page.goto(
				'/unsubscribe/newsletter/pushing-buttons%3A1000000%3A1677075570/token',
			);
			await expect(
				page.getByText(
					'Please click below to complete your unsubscribe from this list',
				),
			).toBeVisible();

			await mockApi.post('/mock/permanent', {
				data: {
					path: '/unsubscribe',
					status: 200,
					body: {},
				},
			});

			await page.locator('button[type="submit"]').click();

			await expect(page.getByText('You have been unsubscribed')).toBeVisible();
		});

		test('should be able to unsubscribe from all marketing consents and newsletters', async ({
			mockApi,
			request,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/unsubscribe-all',
					status: 200,
					body: {},
				},
			});
			const response = await request.post(
				'/unsubscribe-all/1000000%3A1677075570/token',
			);
			expect(response.status()).toBe(200);
		});

		test('should be able to unsubscribe from a marketing email', async ({
			mockApi,
			page,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/unsubscribe',
					status: 200,
					body: {},
				},
			});
			await page.goto(
				'/unsubscribe/marketing/supporter%3A1000000%3A1677075570/token',
			);
			await expect(
				page.getByText(
					'Please click below to complete your unsubscribe from this list',
				),
			).toBeVisible();

			await mockApi.post('/mock/permanent', {
				data: {
					path: '/unsubscribe',
					status: 200,
					body: {},
				},
			});

			await page.locator('button[type="submit"]').click();

			await expect(page.getByText('You have been unsubscribed')).toBeVisible();
		});

		test('should be able to handle a unsubscribe error if emailType is not newsletter/marketing', async ({
			page,
		}) => {
			await page.goto(
				'/unsubscribe/fake/supporter%3A1000000%3A1677075570/token',
			);
			await expect(page.getByText('Unable to unsubscribe.')).toBeVisible();
		});

		test('should be able to handle a unsubscribe error if data is not valid', async ({
			mockApi,
			page,
		}) => {
			await page.goto(
				'/unsubscribe/newsletter/pushing-buttons%3A1000000%3A16770755abc70/token',
			);

			await mockApi.post('/mock/permanent', {
				data: {
					path: '/unsubscribe',
					status: 500,
					body: {
						status: 'error',
						errors: [
							{
								message: 'Invalid data',
							},
						],
					},
				},
			});

			await page.locator('button[type="submit"]').click();

			await expect(page.getByText('Unable to unsubscribe.')).toBeVisible();

			await page.goto(
				'/unsubscribe/newsletter/pushing-buttons%3A1000000%3A/token',
			);
			await expect(page.getByText('Unable to unsubscribe.')).toBeVisible();

			await page.goto('/unsubscribe/newsletter/pushing-buttons-bad-data/token');
			await expect(page.getByText('Unable to unsubscribe.')).toBeVisible();
		});

		test('should be able to handle a unsubscribe error if api error', async ({
			mockApi,
			page,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/unsubscribe',
					status: 400,
					body: {},
				},
			});
			await page.goto(
				'/unsubscribe/fake/supporter%3A1000000%3A1677075570/token',
			);
			await expect(page.getByText('Unable to unsubscribe.')).toBeVisible();
		});
	});
});
