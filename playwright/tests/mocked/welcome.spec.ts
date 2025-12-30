import { test } from '../../fixtures/mockedApiRequest';
import { injectAndCheckAxe } from '../../helpers/accessibility';

test.describe('Welcome and set password page', () => {
	const defaultEmail = 'someone@theguardian.com';
	const checkTokenSuccessResponse = (
		timeUntilExpiry: number | null = null,
		email = defaultEmail,
	) => ({
		user: {
			primaryEmailAddress: email,
		},
		timeUntilExpiry,
	});

	test.beforeEach(async ({ mockApi }) => {
		await mockApi.get('/mock/purge');
	});

	test.describe('A11y checks', () => {
		test('has no detectable a11y violations on the set password page', async ({
			mockApi,
			page,
		}) => {
			await mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn/recovery/token',
					status: 200,
					body: checkTokenSuccessResponse(),
				},
			});
			await page.goto(`/welcome/fake_token`);
			await injectAndCheckAxe(page);
		});

		test('has no detectable a11y violations on set password page with global error', async ({
			mockApi,
			page,
		}) => {
			await Promise.all([
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/authn/recovery/token',
						status: 200,
						body: checkTokenSuccessResponse(),
					},
				}),
				mockApi.post('/mock/permanent', {
					data: {
						path: '/api/v1/authn/credentials/reset_password',
						status: 500,
						body: {},
					},
				}),
			]);
			await page.goto(`/welcome/fake_token`);
			await page.locator('input[name="password"]').fill('short');
			await page.locator('button[type="submit"]').click();
			await injectAndCheckAxe(page);
		});

		test('has no detectable a11y violations on the resend page', async ({
			page,
		}) => {
			await page.goto(`/welcome/resend`);
			await injectAndCheckAxe(page);
		});

		test('has no detectable a11y violations on the resend page with global error', async ({
			mockApi,
			page,
		}) => {
			await page.goto(`/welcome/resend`);

			// Mock user lookup to fail with 500
			await mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/api/v1/users/[^/]+$',
					status: 500,
					body: {},
				},
			});
			await page
				.locator('input[name="email"]')
				.fill(checkTokenSuccessResponse().user.primaryEmailAddress);
			await page.locator('button[type="submit"]').click();
			await injectAndCheckAxe(page);
		});

		test('has no detectable a11y violations on the email sent page with resend box', async ({
			mockApi,
			page,
		}) => {
			await page.goto(`/welcome/resend`);

			// Mock user lookup to succeed (triggers email resend flow)
			await mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/api/v1/users/[^/]+$',
					status: 200,
					body: {
						id: 'okta-user-id-dobeodo',
						status: 'PROVISIONED',
						profile: {
							email: defaultEmail,
							login: defaultEmail,
						},
					},
				},
			});
			// Mock activate user endpoint
			await mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/api/v1/users/.*/lifecycle/activate',
					status: 200,
					body: {
						activationUrl: 'https://profile.thegulocal.com/welcome/token',
						activationToken: 'token',
					},
				},
			});
			await page
				.locator('input[name="email"]')
				.fill(checkTokenSuccessResponse().user.primaryEmailAddress);
			await page.locator('button[type="submit"]').click();
			await injectAndCheckAxe(page);
		});

		test('has no detectable a11y violations on the email sent page without resend box', async ({
			page,
		}) => {
			await page.goto(`/welcome/email-sent`);
			await injectAndCheckAxe(page);
		});
	});
});
