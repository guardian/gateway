/**
 * Test Scenarios:
 *
 * Description                                      | Outcome
 * -------------------------------------------------|-------------------------------------------------------------------
 * State token has expired                          | show session expired page
 * State token invalid, recovery token invalid      | show link expired page
 * State token invalid, recovery token valid        | show reset password page with global error: There was a problem changing your password, please try again.
 * State token absent, recovery token invalid       | show link expired page
 * State token absent, recovery token valid         | show reset password page with global error: There was a problem changing your password, please try again.
 * Unexpected error checking the token              | show link expired page
 * Unexpected error changing the password           | show password page with global error: There was a problem changing your password, please try again.
 * Password is too short                            | show password page with field error: Please make sure your password is at least 8 characters long.
 * Password is too long                             | show password page with field error: Please make sure your password is not longer than 72 characters.
 * Password cannot be your current password         | show reset password page with field error: Please use a password that is different to your current password.
 * Password cannot be a common or breached password | show reset password page with field error: Please use a password that is hard to guess.
 * Password set successfully                        | show password updated confirmation page
 */

import { APIRequestContext, expect } from '@playwright/test';
import { test } from '../../fixtures/mockedApiRequest';
import { randomPassword } from '../../helpers/api/idapi';

test.describe('Change password in Okta', () => {
	const email = 'mrtest@theguardian.com';

	test.beforeEach(async ({ mockApi }) => {
		await mockApi.get('/mock/purge');
	});

	const mockValidateRecoveryTokenSuccess = async (
		mockApi: APIRequestContext,
		date: Date = new Date(Date.now() + 1800000) /* 30mins from now */,
	) => {
		await mockApi.post('/mock', {
			headers: { 'Content-Type': 'application/json', 'x-status': '200' },
			data: {
				stateToken: 'stateToken',
				expiresAt: date.toISOString(),
				status: 'SUCCESS',
				_embedded: {
					user: {
						id: '12345',
						passwordChanged: new Date().toISOString(),
						profile: {
							login: email,
							firstName: null,
							lastName: null,
						},
					},
				},
			},
		});
	};

	const mockValidateRecoveryTokenFailure = async (
		mockApi: APIRequestContext,
	) => {
		await mockApi.post('/mock', {
			headers: { 'Content-Type': 'application/json', 'x-status': '403' },
			data: {
				errorCode: 'E0000105',
				errorSummary:
					'You have accessed an account recovery link that has expired or been previously used.',
				errorLink: 'E0000105',
				errorId: 'errorId',
				errorCauses: [],
			},
		});
	};

	const mockPasswordResetSuccess = async (
		mockApi: APIRequestContext,
		date: Date = new Date(Date.now() + 1800000) /* 30mins from now */,
	) => {
		await mockApi.post('/mock', {
			headers: { 'Content-Type': 'application/json', 'x-status': '200' },
			data: {
				expiresAt: date.toISOString(),
				status: 'SUCCESS',
				sessionToken: 'aValidSessionToken',
				_embedded: {
					user: {
						id: '12345',
						passwordChanged: new Date().toISOString(),
						profile: {
							login: email,
							firstName: null,
							lastName: null,
							locale: 'en_US',
							timeZone: 'America/Los_Angeles',
						},
					},
				},
			},
		});
	};

	const mockUpdateUserSuccess = async (mockApi: APIRequestContext) => {
		await mockApi.post('/mock', {
			headers: { 'Content-Type': 'application/json', 'x-status': '200' },
			data: {
				id: '12345',
				status: 'SUCCESS',
				profile: {
					login: email,
					email,
					isGuardianUser: true,
				},
				credentials: {},
			},
		});
	};

	const mockPasswordResetFailure = async (
		mockApi: APIRequestContext,
		cause: string,
	) => {
		await mockApi.post('/mock', {
			headers: { 'Content-Type': 'application/json', 'x-status': '403' },
			data: {
				errorCode: 'E0000080',
				errorSummary:
					'The password does not meet the complexity requirements of the current password policy.',
				errorLink: 'E0000080',
				errorId: 'errorId',
				errorCauses: [
					{
						errorSummary: cause,
					},
				],
			},
		});
	};

	const mockPasswordResetInvalidStateTokenFailure = async (
		mockApi: APIRequestContext,
	) => {
		await mockApi.post('/mock', {
			headers: { 'Content-Type': 'application/json', 'x-status': '403' },
			data: {
				errorCode: 'E0000011',
				errorSummary: 'Invalid token provided',
				errorLink: 'E0000011',
				errorId: 'errorId',
				errorCauses: [],
			},
		});
	};

	test('shows the link expired page if the state token and the recovery token are invalid', async ({
		page,
		mockApi,
	}) => {
		await mockValidateRecoveryTokenSuccess(mockApi); // needs to succeed once for the page to display
		await mockPasswordResetInvalidStateTokenFailure(mockApi);
		await mockValidateRecoveryTokenFailure(mockApi);

		await page.goto('/reset-password/token');

		await page.locator('input[name="password"]').fill(randomPassword());
		await page.locator('button[type="submit"]').click();

		await expect(page.getByText('Link expired')).toBeVisible();
	});

	test('shows the password reset page with errors if the state token is invalid but the recovery token is still valid', async ({
		page,
		mockApi,
	}) => {
		await mockValidateRecoveryTokenSuccess(mockApi);
		await mockValidateRecoveryTokenSuccess(mockApi);
		await mockPasswordResetInvalidStateTokenFailure(mockApi);
		await mockValidateRecoveryTokenSuccess(mockApi);

		await page.goto('/reset-password/token');

		await page.locator('input[name="password"]').fill(randomPassword());
		await page.locator('button[type="submit"]').click();

		await expect(page.getByText('Create new password')).toBeVisible();
		await expect(
			page.getByText(`You’ve requested to create a new password for ${email}`),
		).toBeVisible();

		await expect(
			page.getByText(
				'There was a problem changing your password, please try again.',
			),
		).toBeVisible();
	});

	test('shows the link expired page if recovery token is invalid after submitting password', async ({
		page,
		context,
		mockApi,
	}) => {
		await mockValidateRecoveryTokenSuccess(mockApi);
		await mockValidateRecoveryTokenFailure(mockApi);

		await page.goto('/reset-password/token');
		await context.clearCookies({ name: 'GU_GATEWAY_STATE' });

		await page.locator('input[name="password"]').fill(randomPassword());
		await page.locator('button[type="submit"]').click();

		await expect(page.getByText('Link expired')).toBeVisible();
	});

	test('shows the link expired page if an unexpected error occurred when validating the recovery token', async ({
		page,
		mockApi,
	}) => {
		await mockApi.post('/mock', {
			headers: { 'Content-Type': 'application/json', 'x-status': '500' },
		});
		await page.goto('/reset-password/token');
		await expect(page.getByText('Link expired')).toBeVisible();
	});

	test('shows the reset password page with errors if an unexpected error occurred when resetting the password', async ({
		page,
		mockApi,
	}) => {
		await mockValidateRecoveryTokenSuccess(mockApi);
		await mockApi.post('/mock', {
			headers: { 'Content-Type': 'application/json', 'x-status': '503' },
		});
		await mockValidateRecoveryTokenSuccess(mockApi);

		await page.goto('/reset-password/token');

		await page.locator('input[name="password"]').fill(randomPassword());
		await page.locator('button[type="submit"]').click();

		await expect(page.getByText('Create new password')).toBeVisible();
		await expect(
			page.getByText(`You’ve requested to create a new password for ${email}`),
		).toBeVisible();
		await expect(
			page.getByText(
				'There was a problem changing your password, please try again.',
			),
		).toBeVisible();
	});

	test('shows the reset password page with field error if the password is too short', async ({
		page,
		mockApi,
	}) => {
		await mockValidateRecoveryTokenSuccess(mockApi);
		await mockPasswordResetFailure(
			mockApi,
			'Password requirements were not met. Password requirements: at least 6 characters.',
		);
		await mockValidateRecoveryTokenSuccess(mockApi);

		await page.goto('/reset-password/token');

		// even though this test is for a short password, we enter a valid password here to bypass
		// client-side password complexity checks in order to test the server-side response
		await page.locator('input[name="password"]').fill(randomPassword());
		await page.locator('button[type="submit"]').click();

		await expect(page.getByText('Create new password')).toBeVisible();
		await expect(
			page.getByText(
				'Please make sure your password is at least 8 characters long.',
			),
		).toBeVisible();
	});

	test('shows the reset password page with field error if the password is too long', async ({
		page,
		mockApi,
	}) => {
		await mockValidateRecoveryTokenSuccess(mockApi);
		await mockPasswordResetFailure(
			mockApi,
			'Password requirements were not met. Password requirements: maximum 72 characters.',
		);
		await mockValidateRecoveryTokenSuccess(mockApi);

		await page.goto('/reset-password/token');

		await page.locator('input[name="password"]').fill(randomPassword());
		await page.locator('button[type="submit"]').click();

		await expect(page.getByText('Create new password')).toBeVisible();
		await expect(
			page.getByText(
				'Please make sure your password is not longer than 72 characters.',
			),
		).toBeVisible();
	});

	test('shows the reset password page with field error if the password is the same as the current password', async ({
		page,
		mockApi,
	}) => {
		await mockValidateRecoveryTokenSuccess(mockApi);
		await mockPasswordResetFailure(
			mockApi,
			'Password cannot be your current password',
		);
		await mockValidateRecoveryTokenSuccess(mockApi);

		await page.goto('/reset-password/token');

		await page.locator('input[name="password"]').fill(randomPassword());
		await page.locator('button[type="submit"]').click();

		await expect(page.getByText('Create new password')).toBeVisible();
		await expect(
			page.getByText(
				'Please use a password that is different to your current password.',
			),
		).toBeVisible();
	});

	test('shows the reset password page with field error if the password is a common or breached password', async ({
		page,
		mockApi,
	}) => {
		await mockValidateRecoveryTokenSuccess(mockApi);
		await mockPasswordResetFailure(
			mockApi,
			'This password was found in a list of commonly used passwords. Please try another password.',
		);
		await mockValidateRecoveryTokenSuccess(mockApi);

		await page.goto('/reset-password/token');

		await page.locator('input[name="password"]').fill(randomPassword());
		await page.locator('button[type="submit"]').click();

		await expect(page.getByText('Create new password')).toBeVisible();
		await expect(
			page.getByText('Please use a password that is hard to guess.'),
		).toBeVisible();
	});

	test('shows the password updated page on successful update', async ({
		page,
		mockApi,
	}) => {
		await mockValidateRecoveryTokenSuccess(mockApi);
		await mockValidateRecoveryTokenSuccess(mockApi);
		await mockPasswordResetSuccess(mockApi);
		await mockUpdateUserSuccess(mockApi);

		// Mock the OAuth authorize endpoint on the mock server
		await mockApi.post('/mock', {
			headers: {
				'Content-Type': 'application/json',
				'x-status': '302',
				'x-path': '/oauth2/oktaauthserverid/v1/authorize',
				'x-header-location':
					'https://profile.thegulocal.com/reset-password/complete',
			},
			data: {},
		});

		await page.goto('/reset-password/token');

		const breachCheckPromise = page.waitForRequest(
			'https://api.pwnedpasswords.com/range/*',
		);
		await page
			.locator('input[name="password"]')
			.fill('thisisalongandunbreachedpassword');
		await breachCheckPromise;

		await page.locator('button[type="submit"]').click();

		await expect(page.getByText('Password updated')).toBeVisible();
		await expect(page.getByText(email)).toBeVisible();

		await expect(page.getByRole('link')).toHaveText('Continue to the Guardian');

		await expect(
			page.locator('a[href="https://m.code.dev-theguardian.com"]'),
		).toBeVisible();
	});
});
