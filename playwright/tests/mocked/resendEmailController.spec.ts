import { expect } from '@playwright/test';
import { test } from '../../fixtures/mockedApiRequest';
import { setEncryptedStateCookie } from '../../helpers/cookies/cookie-helpers';
import userStatuses from '../../../cypress/support/okta/userStatuses';
import userExistsError from '../../../cypress/fixtures/okta-responses/error/user-exists.json';
import userResponse from '../../../cypress/fixtures/okta-responses/success/user.json';
import userGroupsResponse from '../../../cypress/fixtures/okta-responses/success/valid-user-groups.json';
import socialUserResponse from '../../../cypress/fixtures/okta-responses/success/social-user.json';
import successTokenResponse from '../../../cypress/fixtures/okta-responses/success/token.json';
import resetPasswordResponse from '../../../cypress/fixtures/okta-responses/success/reset-password.json';
import idxInteractResponse from '../../../cypress/fixtures/okta-responses/success/idx-interact-response.json';
import idxIntrospectDefaultResponse from '../../../cypress/fixtures/okta-responses/success/idx-introspect-default-response.json';
import idxEnrollResponse from '../../../cypress/fixtures/okta-responses/success/idx-enroll-response.json';
import idxEnrollNewResponse from '../../../cypress/fixtures/okta-responses/success/idx-enroll-new-response.json';
import idxEnrollNewSelectAuthenticatorResponse from '../../../cypress/fixtures/okta-responses/success/idx-enroll-new-response-select-authenticator.json';
import idxEnrollNewExistingUserResponse from '../../../cypress/fixtures/okta-responses/error/idx-enroll-new-existing-user-response.json';
import { identifyResponse } from '../../../cypress/fixtures/okta-responses/success/idx-identify-response';
import idxChallengeResponseEmail from '../../../cypress/fixtures/okta-responses/success/idx-challenge-response-email.json';
import { dangerouslySetPlaceholderPasswordMocks } from '../../helpers/api/placeholder-password-mock';

// IDX passcode registration mocks
const baseIdxPasscodeRegistrationMocks = async (mockApi: any) => {
	await Promise.all([
		mockApi.post('/mock/permanent-pattern', {
			data: {
				pattern: '/oauth2/.*/v1/interact',
				status: idxInteractResponse.code,
				body: idxInteractResponse.response,
			},
		}),
		mockApi.post('/mock/permanent', {
			data: {
				path: '/idp/idx/introspect',
				status: idxIntrospectDefaultResponse.code,
				body: idxIntrospectDefaultResponse.response,
			},
		}),
		mockApi.post('/mock/permanent', {
			data: {
				path: '/idp/idx/enroll',
				status: idxEnrollResponse.code,
				body: idxEnrollResponse.response,
			},
		}),
	]);
};

// IDX passcode existing user mocks
const idxPasscodeExistingUserMocks = async (mockApi: any) => {
	await Promise.all([
		mockApi.post('/mock/permanent-pattern', {
			data: {
				pattern: '/oauth2/.*/v1/interact',
				status: idxInteractResponse.code,
				body: idxInteractResponse.response,
			},
		}),
		mockApi.post('/mock/permanent', {
			data: {
				path: '/idp/idx/introspect',
				status: idxIntrospectDefaultResponse.code,
				body: idxIntrospectDefaultResponse.response,
			},
		}),
	]);
};

const verifyInRegularEmailSentPage = async (page: any) => {
	await expect(page.getByText('Check your inbox')).toBeVisible();
	await expect(page.getByText('send again')).toBeVisible();
	await expect(page.getByText('within 2 minutes')).not.toBeVisible();
};

const verifyInPasscodeEmailSentPage = async (page: any) => {
	await expect(page.getByText('Enter your one-time code')).toBeVisible();
	await expect(page.getByText('send again')).toBeVisible();
};

userStatuses.forEach((status) => {
	test.beforeEach(async ({ mockApi }) => {
		await mockApi.get('/mock/purge');
	});

	test.describe(`Given I am a ${status || 'nonexistent'} user`, () => {
		// ==========================================
		// Tests for /register/email-sent
		// ==========================================
		test.describe('When I submit the form on /register/email-sent', () => {
			test.beforeEach(async ({ page, context }) => {
				await setEncryptedStateCookie(context, {
					email: 'example@example.com',
				});
				await page.goto('/register/email-sent');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status: 'STAGED' };
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userResponse.code,
								body: response,
							},
						});
						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInRegularEmailSentPage(page);
					});
					break;

				case 'ACTIVE':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll',
								status: userExistsError.code,
								body: userExistsError.response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userResponse.code,
								body: response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/groups',
								status: userGroupsResponse.code,
								body: userGroupsResponse.response,
							},
						});

						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInRegularEmailSentPage(page);
					});

					test("Then I should be shown the 'Check your inbox' page for social users", async ({
						mockApi,
						page,
					}) => {
						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll',
								status: userExistsError.code,
								body: userExistsError.response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: socialUserResponse.code,
								body: socialUserResponse.response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/groups',
								status: userGroupsResponse.code,
								body: userGroupsResponse.response,
							},
						});

						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInRegularEmailSentPage(page);
					});

					test("Then I should be shown the 'Check your inbox' page if I don't have a validated email and don't have a password set", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };
						const userGroupsResponseWithoutEmailValidated =
							userGroupsResponse.response.filter(
								(group) => group.profile.name !== 'GuardianUser-EmailValidated',
							);

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll',
								status: userExistsError.code,
								body: userExistsError.response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/groups',
								status: userGroupsResponse.code,
								body: userGroupsResponseWithoutEmailValidated,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/reset_password',
								status: 200,
								body: {
									resetPasswordUrl:
										'https://example.com/reset_password/XE6wE17zmphl3KqAPFxO',
								},
							},
						});

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/api/v1/authn/recovery/token',
								status: 200,
								body: {
									stateToken: 'sometoken',
								},
							},
						});

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/api/v1/authn/credentials/reset_password',
								status: 200,
								body: {},
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/forgot_password',
								status: 200,
								body: {
									resetPasswordUrl:
										'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
								},
							},
						});

						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInRegularEmailSentPage(page);
					});

					test("Then I should be shown the 'Check your inbox' page if I don't have a validated email and do have a password set", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll',
								status: userExistsError.code,
								body: userExistsError.response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userResponse.code,
								body: response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/groups',
								status: userGroupsResponse.code,
								body: userGroupsResponse.response,
							},
						});

						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInRegularEmailSentPage(page);
					});
					break;

				case 'PROVISIONED':
				case 'STAGED':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll',
								status: userExistsError.code,
								body: userExistsError.response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userResponse.code,
								body: response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/activate',
								status: successTokenResponse.code,
								body: successTokenResponse.response,
							},
						});

						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInRegularEmailSentPage(page);
					});
					break;

				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll',
								status: userExistsError.code,
								body: userExistsError.response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userResponse.code,
								body: response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/reset_password',
								status: resetPasswordResponse.code,
								body: resetPasswordResponse.response,
							},
						});

						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInRegularEmailSentPage(page);
					});
					break;
			}
		});

		// ==========================================
		// Tests for /welcome/email-sent
		// ==========================================
		test.describe('When I submit the form on /welcome/email-sent', () => {
			test.beforeEach(async ({ page, context }) => {
				await setEncryptedStateCookie(context, {
					email: 'example@example.com',
				});
				await page.goto('/welcome/email-sent');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						await baseIdxPasscodeRegistrationMocks(mockApi);

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll/new',
								status: idxEnrollNewSelectAuthenticatorResponse.code,
								body: idxEnrollNewSelectAuthenticatorResponse.response,
							},
						});

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/credential/enroll',
								status: idxEnrollNewResponse.code,
								body: idxEnrollNewResponse.response,
							},
						});

						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInPasscodeEmailSentPage(page);
					});
					break;

				case 'ACTIVE':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						await baseIdxPasscodeRegistrationMocks(mockApi);

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll/new',
								status: idxEnrollNewExistingUserResponse.code,
								body: idxEnrollNewExistingUserResponse.response,
							},
						});

						const response = { ...userResponse.response, status };
						const responseWithPassword = {
							...response,
							credentials: {
								...response.credentials,
								password: {},
							},
						};

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll',
								status: userExistsError.code,
								body: userExistsError.response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: responseWithPassword,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/groups',
								status: userGroupsResponse.code,
								body: userGroupsResponse.response,
							},
						});

						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInRegularEmailSentPage(page);
					});

					test("Then I should be shown the 'Check your inbox' page for social user", async ({
						mockApi,
						page,
					}) => {
						await baseIdxPasscodeRegistrationMocks(mockApi);

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll/new',
								status: idxEnrollNewExistingUserResponse.code,
								body: idxEnrollNewExistingUserResponse.response,
							},
						});

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll',
								status: userExistsError.code,
								body: userExistsError.response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: socialUserResponse.code,
								body: socialUserResponse.response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/groups',
								status: userGroupsResponse.code,
								body: userGroupsResponse.response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/reset_password',
								status: 200,
								body: {
									resetPasswordUrl:
										'https://example.com/reset_password/XE6wE17zmphl3KqAPFxO',
								},
							},
						});

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/api/v1/authn/recovery/token',
								status: 200,
								body: {
									stateToken: 'sometoken',
								},
							},
						});

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/api/v1/authn/credentials/reset_password',
								status: 200,
								body: {},
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/forgot_password',
								status: 200,
								body: {
									resetPasswordUrl:
										'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
								},
							},
						});

						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInRegularEmailSentPage(page);
					});
					break;

				case 'PROVISIONED':
				case 'STAGED':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						await baseIdxPasscodeRegistrationMocks(mockApi);

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll/new',
								status: idxEnrollNewExistingUserResponse.code,
								body: idxEnrollNewExistingUserResponse.response,
							},
						});

						const response = { ...userResponse.response, status };

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll',
								status: userExistsError.code,
								body: userExistsError.response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userResponse.code,
								body: response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/activate',
								status: successTokenResponse.code,
								body: successTokenResponse.response,
							},
						});

						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInRegularEmailSentPage(page);
					});
					break;

				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						await baseIdxPasscodeRegistrationMocks(mockApi);

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll/new',
								status: idxEnrollNewExistingUserResponse.code,
								body: idxEnrollNewExistingUserResponse.response,
							},
						});

						const response = { ...userResponse.response, status };

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll',
								status: userExistsError.code,
								body: userExistsError.response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userResponse.code,
								body: response,
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/reset_password',
								status: resetPasswordResponse.code,
								body: resetPasswordResponse.response,
							},
						});

						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInRegularEmailSentPage(page);
					});
					break;
			}
		});

		// ==========================================
		// Tests for /welcome/resend
		// ==========================================
		test.describe('When I submit the form on /welcome/resend', () => {
			test.beforeEach(async ({ page }) => {
				await page.goto('/welcome/resend');
				await page.locator('input[name="email"]').fill('example@example.com');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Enter your code' page", async ({
						mockApi,
						page,
					}) => {
						await baseIdxPasscodeRegistrationMocks(mockApi);

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll/new',
								status: idxEnrollNewSelectAuthenticatorResponse.code,
								body: idxEnrollNewSelectAuthenticatorResponse.response,
							},
						});

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/credential/enroll',
								status: idxEnrollNewResponse.code,
								body: idxEnrollNewResponse.response,
							},
						});

						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInPasscodeEmailSentPage(page);
					});
					break;

				case 'ACTIVE':
					test("Then I should be shown the 'Enter your code' page", async ({
						mockApi,
						page,
					}) => {
						await baseIdxPasscodeRegistrationMocks(mockApi);

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll/new',
								status: idxEnrollNewExistingUserResponse.code,
								body: idxEnrollNewExistingUserResponse.response,
							},
						});

						const response = { ...userResponse.response, status };
						const responseWithPassword = {
							...response,
							credentials: {
								...response.credentials,
								password: {},
							},
						};

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userResponse.code,
								body: responseWithPassword,
							},
						});

						await idxPasscodeExistingUserMocks(mockApi);

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/identify',
								status: 200,
								body: identifyResponse(true, true),
							},
						});

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/challenge',
								status: idxChallengeResponseEmail.code,
								body: idxChallengeResponseEmail.response,
							},
						});

						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInPasscodeEmailSentPage(page);
					});
					break;

				case 'PROVISIONED':
				case 'STAGED':
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						await baseIdxPasscodeRegistrationMocks(mockApi);

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll/new',
								status: idxEnrollNewExistingUserResponse.code,
								body: idxEnrollNewExistingUserResponse.response,
							},
						});

						const response = { ...userResponse.response, status };

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: {
									...response,
									status,
								},
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/activate',
								status: 200,
								body: {},
							},
						});

						await dangerouslySetPlaceholderPasswordMocks(
							mockApi,
							'test@example.com',
						);

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: 200,
								body: { ...userResponse.response, status: 'ACTIVE' },
							},
						});

						await idxPasscodeExistingUserMocks(mockApi);

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/identify',
								status: 200,
								body: identifyResponse(true, true),
							},
						});

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/challenge',
								status: idxChallengeResponseEmail.code,
								body: idxChallengeResponseEmail.response,
							},
						});

						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInPasscodeEmailSentPage(page);
					});
					break;
			}
		});

		// ==========================================
		// Tests for /welcome/expired
		// ==========================================
		test.describe('When I submit the form on /welcome/expired', () => {
			test.beforeEach(async ({ page }) => {
				await page.goto('/welcome/expired');
				await page.locator('input[name="email"]').fill('example@example.com');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Enter your code' page", async ({
						mockApi,
						page,
					}) => {
						await baseIdxPasscodeRegistrationMocks(mockApi);

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll/new',
								status: idxEnrollNewSelectAuthenticatorResponse.code,
								body: idxEnrollNewSelectAuthenticatorResponse.response,
							},
						});

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/credential/enroll',
								status: idxEnrollNewResponse.code,
								body: idxEnrollNewResponse.response,
							},
						});

						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInPasscodeEmailSentPage(page);
					});
					break;

				case 'ACTIVE':
					test("Then I should be shown the 'Enter your code' page", async ({
						mockApi,
						page,
					}) => {
						await baseIdxPasscodeRegistrationMocks(mockApi);

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll/new',
								status: idxEnrollNewExistingUserResponse.code,
								body: idxEnrollNewExistingUserResponse.response,
							},
						});

						const response = { ...userResponse.response, status };
						const responseWithPassword = {
							...response,
							credentials: {
								...response.credentials,
								password: {},
							},
						};

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userResponse.code,
								body: responseWithPassword,
							},
						});

						await idxPasscodeExistingUserMocks(mockApi);

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/identify',
								status: 200,
								body: identifyResponse(true, true),
							},
						});

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/challenge',
								status: idxChallengeResponseEmail.code,
								body: idxChallengeResponseEmail.response,
							},
						});

						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInPasscodeEmailSentPage(page);
					});
					break;

				case 'PROVISIONED':
				case 'STAGED':
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						await baseIdxPasscodeRegistrationMocks(mockApi);

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/enroll/new',
								status: idxEnrollNewExistingUserResponse.code,
								body: idxEnrollNewExistingUserResponse.response,
							},
						});

						const response = { ...userResponse.response, status };

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: {
									...response,
									status,
								},
							},
						});

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/activate',
								status: 200,
								body: {},
							},
						});

						await dangerouslySetPlaceholderPasswordMocks(
							mockApi,
							'test@example.com',
						);

						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: 200,
								body: { ...userResponse.response, status: 'ACTIVE' },
							},
						});

						await idxPasscodeExistingUserMocks(mockApi);

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/identify',
								status: 200,
								body: identifyResponse(true, true),
							},
						});

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/challenge',
								status: idxChallengeResponseEmail.code,
								body: idxChallengeResponseEmail.response,
							},
						});

						await page.locator('[data-cy="main-form-submit-button"]').click();
						await verifyInPasscodeEmailSentPage(page);
					});
					break;
			}
		});
	});
});
