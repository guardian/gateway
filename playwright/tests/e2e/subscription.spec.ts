import { test, expect, Page } from '@playwright/test';
import crypto from 'crypto';
import { createTestUser } from '../../helpers/api/idapi';

test.describe('Unsubscribe newsletter/marketing email', () => {
	const newsletterId = 'today-uk';
	const marketingId = 'supporter';

	const createData = (newsletterId: string, userId: string) =>
		`${newsletterId}:${userId}:${Math.floor(Date.now() / 1000)}`;

	const createToken = (data: string) =>
		crypto
			.createHmac('sha1', process.env.CYPRESS_BRAZE_HMAC_KEY || '')
			.update(data)
			.digest('hex');

	const subscribe = async (
		page: Page,
		type: 'newsletter' | 'marketing' | 'fake',
		data: string,
		expectSuccess = true,
	) => {
		const token = createToken(data);
		const url = `/subscribe/${type}/${encodeURIComponent(data)}/${token}`;
		await page.goto(url);

		if (expectSuccess) {
			await expect(page.getByText('You have been subscribed')).toBeVisible();
		} else {
			await expect(page.getByText('Unable to subscribe.')).toBeVisible();
		}
	};

	const unsubscribe = async (
		page: Page,
		type: 'newsletter' | 'marketing' | 'fake',
		data: string,
		expectSuccess = true,
	) => {
		await page.goto(
			`/unsubscribe/${type}/${encodeURIComponent(data)}/${createToken(data)}`,
		);

		if (expectSuccess) {
			await expect(page.getByText('You have been unsubscribed')).toBeVisible();
		} else {
			await expect(page.getByText('Unable to unsubscribe.')).toBeVisible();
		}
	};

	test('should be able to unsubscribe from a newsletter', async ({
		request,
		page,
	}) => {
		const { idapiUserId } = await createTestUser(request, {
			isUserEmailValidated: true,
		});
		const data = createData(newsletterId, idapiUserId);
		await subscribe(page, 'newsletter', data);
		await unsubscribe(page, 'newsletter', data);
	});

	test('should be able to unsubscribe from a marketing email', async ({
		request,
		page,
	}) => {
		const { idapiUserId } = await createTestUser(request, {
			isUserEmailValidated: true,
		});
		const data = createData(marketingId, idapiUserId);
		await subscribe(page, 'marketing', data);
		await unsubscribe(page, 'marketing', data);
	});

	test('should be able to unsubscribe from all emails', async ({
		request,
		page,
	}) => {
		const { idapiUserId } = await createTestUser(request, {
			isUserEmailValidated: true,
		});
		const data = `${idapiUserId}:${Math.floor(Date.now() / 1000)}`;
		const response = await page.request.post(
			`/unsubscribe-all/${encodeURIComponent(data)}/${createToken(data)}`,
		);
		expect(response.status()).toBe(200);
	});

	test('should be able to handle a subscribe error if emailType is not newsletter/marketing', async ({
		request,
		page,
	}) => {
		const { idapiUserId } = await createTestUser(request, {
			isUserEmailValidated: true,
		});
		const data = createData(marketingId, idapiUserId);
		await subscribe(page, 'fake', data, false);
	});

	test('should be able to handle a unsubscribe error if emailType is not newsletter/marketing', async ({
		request,
		page,
	}) => {
		const { idapiUserId } = await createTestUser(request, {
			isUserEmailValidated: true,
		});
		const data = createData(marketingId, idapiUserId);
		await unsubscribe(page, 'fake', data, false);
	});

	test('should be able to handle a subscribe error if token is invalid', async ({
		request,
		page,
	}) => {
		const { idapiUserId } = await createTestUser(request, {
			isUserEmailValidated: true,
		});
		const data = createData(newsletterId, idapiUserId);
		await page.goto(
			`/subscribe/newsletter/${encodeURIComponent(data)}/fake_token`,
		);
		await expect(page.getByText('Unable to subscribe.')).toBeVisible();
	});

	test('should be able to handle a unsubscribe error if token is invalid', async ({
		request,
		page,
	}) => {
		const { idapiUserId } = await createTestUser(request, {
			isUserEmailValidated: true,
		});
		const data = createData(newsletterId, idapiUserId);
		await subscribe(page, 'newsletter', data);
		await page.goto(
			`/unsubscribe/newsletter/${encodeURIComponent(data)}/fake_token`,
		);
		await expect(page.getByText('Unable to unsubscribe.')).toBeVisible();
	});

	test('should be able to handle a subscribe error if newsletterId is invalid', async ({
		request,
		page,
	}) => {
		const { idapiUserId } = await createTestUser(request, {
			isUserEmailValidated: true,
		});
		const data = createData(`${newsletterId}-fake`, idapiUserId);
		await subscribe(page, 'newsletter', data, false);
	});

	test('should be able to handle an unsubscribe error if newsletterId is invalid', async ({
		request,
		page,
	}) => {
		const { idapiUserId } = await createTestUser(request, {
			isUserEmailValidated: true,
		});
		const data = createData(newsletterId, idapiUserId);
		await subscribe(page, 'newsletter', data);
		const fakeData = createData(`${newsletterId}-fake`, idapiUserId);
		await unsubscribe(page, 'newsletter', fakeData, false);
	});

	test('should be able to handle a subscribe error if marketingId is invalid', async ({
		request,
		page,
	}) => {
		const { idapiUserId } = await createTestUser(request, {
			isUserEmailValidated: true,
		});
		const data = createData(`${marketingId}-fake`, idapiUserId);
		await subscribe(page, 'marketing', data, false);
	});

	test('should be able to handle an unsubscribe error if marketingId is invalid', async ({
		request,
		page,
	}) => {
		const { idapiUserId } = await createTestUser(request, {
			isUserEmailValidated: true,
		});
		const data = createData(marketingId, idapiUserId);
		await subscribe(page, 'marketing', data);
		const fakeData = createData(`${marketingId}-fake`, idapiUserId);
		await unsubscribe(page, 'marketing', fakeData, false);
	});

	test('should be able to handle a subscribe error if userId is invalid', async ({
		page,
	}) => {
		const data = createData(marketingId, 'not-an-id');
		await subscribe(page, 'marketing', data, false);
	});

	test('should be able to handle a unsubscribe error if userId is invalid', async ({
		page,
	}) => {
		const data = createData(marketingId, 'not-an-id');
		await unsubscribe(page, 'marketing', data, false);
	});

	test('should be able to handle a subscribe error if data is invalid', async ({
		page,
	}) => {
		const data = 'data-is-invalid:yes-123';
		await subscribe(page, 'marketing', data, false);
	});

	test('should be able to handle a unsubscribe error if data is invalid', async ({
		page,
	}) => {
		const data = 'data-is-invalid:yes-123';
		await unsubscribe(page, 'marketing', data, false);
	});
});
