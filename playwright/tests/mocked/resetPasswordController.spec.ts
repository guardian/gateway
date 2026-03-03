import { APIRequestContext, expect, Page } from '@playwright/test';
import { test } from '../../fixtures/mockedApiRequest';
import { setEncryptedStateCookie } from '../../helpers/cookies/cookie-helpers';
import userStatuses from '../../support/okta/userStatuses';
import userNotFoundError from '../../fixtures/okta-responses/error/user-not-found.json';
import oktaPermissionsError from '../../fixtures/okta-responses/error/no-permission.json';
import userResponse from '../../fixtures/okta-responses/success/user.json';
import socialUserResponse from '../../fixtures/okta-responses/success/social-user.json';
import resetPasswordResponse from '../../fixtures/okta-responses/success/reset-password.json';
import verifyRecoveryTokenResponse from '../../fixtures/okta-responses/success/verify-recovery-token.json';
import authResetPasswordResponse from '../../fixtures/okta-responses/success/auth-reset-password.json';
import updateUser from '../../fixtures/okta-responses/success/update-user.json';
import { identifyResponse } from '../../fixtures/okta-responses/success/idx-identify-response';
import idxChallengeResponsePassword from '../../fixtures/okta-responses/success/idx-challenge-response-password.json';
import idxChallengeResponseEmail from '../../fixtures/okta-responses/success/idx-challenge-response-email.json';
import idxRecoverResponse from '../../fixtures/okta-responses/success/idx-recover-response.json';
import idxChallengeAnswerPasswordEnrollEmailResponse from '../../fixtures/okta-responses/success/idx-challenge-answer-password-enroll-email-response.json';
import idxInteractResponse from '../../fixtures/okta-responses/success/idx-interact-response.json';
import idxIntrospectDefaultResponse from '../../fixtures/okta-responses/success/idx-introspect-default-response.json';
import { dangerouslySetPlaceholderPasswordMocks } from '../../helpers/api/placeholder-password-mock';

// ============================================
// Helper Functions
// ============================================

const baseIdxPasscodeResetPasswordMocks = async (
	mockApi: APIRequestContext,
) => {
	await Promise.all([
		// interact
		mockApi.post('/mock/permanent-pattern', {
			data: {
				pattern: '/oauth2/.*/v1/interact',
				status: idxInteractResponse.code,
				body: idxInteractResponse.response,
			},
		}),
		// introspect
		mockApi.post('/mock/permanent', {
			data: {
				path: '/idp/idx/introspect',
				status: idxIntrospectDefaultResponse.code,
				body: idxIntrospectDefaultResponse.response,
			},
		}),
	]);
};

const setupMocksForSocialUserPasswordReset = async (
	mockApi: APIRequestContext,
) => {
	// Set up permanent mocks for endpoints that always return the same response
	await Promise.all([
		// Response from getUser() - same for both calls
		mockApi.post('/mock/permanent-pattern', {
			data: {
				pattern: '/api/v1/users/[^/]+$',
				status: socialUserResponse.code,
				body: socialUserResponse.response,
			},
		}),
		// Response from dangerouslyResetPassword() - a reset password URL
		mockApi.post('/mock/permanent-pattern', {
			data: {
				pattern: '/api/v1/users/.*/lifecycle/reset_password',
				status: resetPasswordResponse.code,
				body: resetPasswordResponse.response,
			},
		}),
		// Response from validateRecoveryToken() - a state token
		mockApi.post('/mock/permanent', {
			data: {
				path: '/api/v1/authn/recovery/token',
				status: verifyRecoveryTokenResponse.code,
				body: verifyRecoveryTokenResponse.response,
			},
		}),
		// Response from resetPassword()
		mockApi.post('/mock/permanent', {
			data: {
				path: '/api/v1/authn/credentials/reset_password',
				status: authResetPasswordResponse.code,
				body: authResetPasswordResponse.response,
			},
		}),
	]);

	await mockApi.post('/mock', {
		headers: {
			'X-path': '/api/v1/users/{userId}/credentials/forgot_password',
			'X-status': '200',
		},
		data: {
			resetPasswordUrl:
				'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
		},
	});
	await mockApi.post('/mock', {
		headers: {
			'X-path': '/api/v1/users/{userId}',
			'X-status': String(updateUser.code),
		},
		data: updateUser.response,
	});
	await mockApi.post('/mock', {
		headers: {
			'X-path': '/api/v1/users/{userId}/credentials/forgot_password',
			'X-status': String(oktaPermissionsError.code),
		},
		data: oktaPermissionsError.response,
	});
};

const setupMocksForActiveUsersWithEmailPasswordFactors = async (
	mockApi: APIRequestContext,
	status: string,
) => {
	const response = { ...userResponse.response, status };
	await mockApi.post('/mock/permanent-pattern', {
		data: {
			pattern: '/api/v1/users/[^/]+$',
			status: userResponse.code,
			body: response,
		},
	});
	await baseIdxPasscodeResetPasswordMocks(mockApi);
	await mockApi.post('/mock/permanent', {
		data: {
			path: '/idp/idx/identify',
			status: 200,
			body: identifyResponse(true, true),
		},
	});
	await mockApi.post('/mock/permanent', {
		data: {
			path: '/idp/idx/recover',
			status: idxRecoverResponse.code,
			body: idxRecoverResponse.response,
		},
	});
	// /idp/idx/challenge is called twice with different responses:
	// 1.) authenticator.methodType === 'password' -  password challenge response
	// 2.) authenticator.methodType === 'email' -  email challenge response
	// Using permanent-body mocks to match the request body
	await mockApi.post('/mock/permanent-body', {
		data: {
			path: '/idp/idx/challenge',
			bodyMatch: { authenticator: { methodType: 'password' } },
			status: idxChallengeResponsePassword.code,
			body: idxChallengeResponsePassword.response,
		},
	});
	await mockApi.post('/mock/permanent-body', {
		data: {
			path: '/idp/idx/challenge',
			bodyMatch: { authenticator: { methodType: 'email' } },
			status: idxChallengeResponseEmail.code,
			body: idxChallengeResponseEmail.response,
		},
	});
};

const setupMocksForActiveUsersEmailFactorOnly = async (
	mockApi: APIRequestContext,
	status: string,
) => {
	const response = { ...userResponse.response, status };

	await baseIdxPasscodeResetPasswordMocks(mockApi);
	await mockApi.post('/mock/permanent', {
		data: {
			path: '/idp/idx/identify',
			status: 200,
			body: identifyResponse(true, false),
		},
	});
	await dangerouslySetPlaceholderPasswordMocks(mockApi, 'example@example.com');
	await mockApi.post('/mock/permanent-pattern', {
		data: {
			pattern: '/api/v1/users/[^/]+$',
			status: userResponse.code,
			body: response,
		},
	});
	await baseIdxPasscodeResetPasswordMocks(mockApi);
	await mockApi.post('/mock/permanent', {
		data: {
			path: '/idp/idx/identify',
			status: 200,
			body: identifyResponse(true, true),
		},
	});
	await mockApi.post('/mock/permanent', {
		data: {
			path: '/idp/idx/recover',
			status: idxRecoverResponse.code,
			body: idxRecoverResponse.response,
		},
	});
	// /idp/idx/challenge is called twice with different responses:
	// 1.) authenticator.methodType === 'password' -  password challenge response
	// 2.) authenticator.methodType === 'email' -  email challenge response
	// Using permanent-body mocks to match the request body
	await mockApi.post('/mock/permanent-body', {
		data: {
			path: '/idp/idx/challenge',
			bodyMatch: { authenticator: { methodType: 'password' } },
			status: idxChallengeResponsePassword.code,
			body: idxChallengeResponsePassword.response,
		},
	});
	await mockApi.post('/mock/permanent-body', {
		data: {
			path: '/idp/idx/challenge',
			bodyMatch: { authenticator: { methodType: 'email' } },
			status: idxChallengeResponseEmail.code,
			body: idxChallengeResponseEmail.response,
		},
	});
};

const setupMocksForActiveUsersPasswordFactorOnly = async (
	mockApi: APIRequestContext,
	status: string,
) => {
	const response = { ...userResponse.response, status };

	await Promise.all([
		// User lookup
		mockApi.post('/mock/permanent-pattern', {
			data: {
				pattern: '/api/v1/users/[^/]+$',
				status: userResponse.code,
				body: response,
			},
		}),
		// interact
		mockApi.post('/mock/permanent-pattern', {
			data: {
				pattern: '/oauth2/.*/v1/interact',
				status: idxInteractResponse.code,
				body: idxInteractResponse.response,
			},
		}),
		// introspect - first call
		mockApi.post('/mock/permanent-body', {
			data: {
				path: '/idp/idx/introspect',
				bodyMatch: { interactionHandle: 'someInteractionHandle' },
				status: idxIntrospectDefaultResponse.code,
				body: idxIntrospectDefaultResponse.response,
			},
		}),
		// introspect - second call
		// (needs challenge authenicator remediation)
		mockApi.post('/mock/permanent-body', {
			data: {
				path: '/idp/idx/introspect',
				bodyMatch: { stateHandle: '02.id.state~c.handle' },
				status: idxChallengeResponsePassword.code,
				body: idxChallengeResponsePassword.response,
			},
		}),
		// identify
		mockApi.post('/mock/permanent', {
			data: {
				path: '/idp/idx/identify',
				status: 200,
				body: identifyResponse(false, true),
			},
		}),
		// challenge
		mockApi.post('/mock/permanent', {
			data: {
				path: '/idp/idx/challenge',
				status: idxChallengeResponsePassword.code,
				body: idxChallengeResponsePassword.response,
			},
		}),
		// challenge/answer
		mockApi.post('/mock/permanent', {
			data: {
				path: '/idp/idx/challenge/answer',
				status: idxChallengeAnswerPasswordEnrollEmailResponse.code,
				body: idxChallengeAnswerPasswordEnrollEmailResponse.response,
			},
		}),
		// credential/enroll - enrolls email authenticator, returns email challenge response
		mockApi.post('/mock/permanent', {
			data: {
				path: '/idp/idx/credential/enroll',
				status: idxChallengeResponseEmail.code,
				body: idxChallengeResponseEmail.response,
			},
		}),
		// dangerouslyResetPassword
		mockApi.post('/mock/permanent-pattern', {
			data: {
				pattern: '/api/v1/users/.*/lifecycle/reset_password',
				status: 200,
				body: {
					resetPasswordUrl:
						'https://profile.thegulocal.com/reset_password/token_token_token_to',
					activationUrl: 'token_token_token_to',
					activationToken: 'token_token_token_to',
				},
			},
		}),
		// validateRecoveryToken
		mockApi.post('/mock/permanent', {
			data: {
				path: '/api/v1/authn/recovery/token',
				status: 200,
				body: {
					stateToken: 'stateToken',
					expiresAt: new Date(
						Date.now() + 1800000,
					).toISOString() /* 30mins from now */,
					status: 'SUCCESS',
					_embedded: {
						user: {
							id: '12345',
							passwordChanged: new Date().toISOString(),
							profile: {
								login: 'example@example.com',
								firstName: null,
								lastName: null,
							},
						},
					},
				},
			},
		}),
		// resetPassword
		mockApi.post('/mock/permanent', {
			data: {
				path: '/api/v1/authn/credentials/reset_password',
				status: 200,
				body: {
					expiresAt: new Date(
						Date.now() + 1800000,
					).toISOString() /* 30mins from now */,
					status: 'SUCCESS',
					sessionToken: 'aValidSessionToken',
					_embedded: {
						user: {
							id: '12345',
							passwordChanged: new Date().toISOString(),
							profile: {
								login: 'example@example.com',
								firstName: null,
								lastName: null,
								locale: 'en_US',
								timeZone: 'America/Los_Angeles',
							},
						},
					},
				},
			},
		}),
	]);
};

const setupMocksForNonActiveUsers = async (
	mockApi: APIRequestContext,
	status: string,
) => {
	const response = { ...userResponse.response, status };
	await mockApi.post('/mock/permanent-pattern', {
		data: {
			pattern: '/api/v1/users/[^/]+$',
			status: userResponse.code,
			body: response,
		},
	});
	await baseIdxPasscodeResetPasswordMocks(mockApi);
	await mockApi.post('/mock/permanent-pattern', {
		data: {
			pattern: '/api/v1/users/.*/lifecycle/deactivate',
			status: 200,
			body: {},
		},
	});
	await mockApi.post('/mock/permanent-pattern', {
		data: {
			pattern: '/api/v1/users/.*/lifecycle/activate',
			status: 200,
			body: {
				activationUrl: 'https://profile.thegulocal.com/activate/dobedo',
				activationToken: 'dobedo',
			},
		},
	});
	await mockApi.post('/mock/permanent-pattern', {
		data: {
			pattern: '/api/v1/users/.*/lifecycle/reactivate',
			status: 200,
			body: {
				activationUrl: 'https://profile.thegulocal.com/activate/dobedo',
				activationToken: 'dobedo',
			},
		},
	});
	await dangerouslySetPlaceholderPasswordMocks(mockApi, 'test@example.com');
	await mockApi.post('/mock/permanent-pattern', {
		data: {
			pattern: '/api/v1/users/[^/]+$',
			status: 200,
			body: { ...userResponse.response, status: 'ACTIVE' },
		},
	});
	await baseIdxPasscodeResetPasswordMocks(mockApi);
	await mockApi.post('/mock/permanent', {
		data: {
			path: '/idp/idx/identify',
			status: 200,
			body: identifyResponse(true, true),
		},
	});
	await mockApi.post('/mock/permanent', {
		data: {
			path: '/idp/idx/recover',
			status: idxRecoverResponse.code,
			body: idxRecoverResponse.response,
		},
	});
	// /idp/idx/challenge is called twice with different responses:
	// 1.) authenticator.methodType === 'password' -  password challenge response
	// 2.) authenticator.methodType === 'email' -  email challenge response
	// Using permanent-body mocks to match the request body
	await mockApi.post('/mock/permanent-body', {
		data: {
			path: '/idp/idx/challenge',
			bodyMatch: { authenticator: { methodType: 'password' } },
			status: idxChallengeResponsePassword.code,
			body: idxChallengeResponsePassword.response,
		},
	});
	await mockApi.post('/mock/permanent-body', {
		data: {
			path: '/idp/idx/challenge',
			bodyMatch: { authenticator: { methodType: 'email' } },
			status: idxChallengeResponseEmail.code,
			body: idxChallengeResponseEmail.response,
		},
	});
};

const verifyIn2MinutesEmailSentPage = async (page: Page) => {
	await expect(page.getByText('Check your inbox')).toBeVisible();
	await expect(page.getByText('send again')).toBeVisible();
	await expect(page.getByText(/We.ve sent an email/)).toBeVisible();
	await expect(page.getByText('within 2 minutes')).toBeVisible();
};

const verifyInRegularEmailSentPage = async (page: Page) => {
	await expect(page.getByText('Check your inbox')).toBeVisible();
	await expect(page.getByText('send again')).toBeVisible();
	await expect(page.getByText(/We.ve sent an email/)).toBeVisible();
	await expect(page.getByText('within 2 minutes')).not.toBeVisible();
};

const verifyIn2MinutesEmailSentPagePasscodes = async (page: Page) => {
	await expect(page.getByText('Enter your one-time code')).toBeVisible();
	await expect(page.getByText('send again')).toBeVisible();
	await expect(page.getByText(/We.ve sent a 6-digit code/)).toBeVisible();
	await expect(page.getByText('within 2 minutes')).toBeVisible();
};

// ============================================
// Tests
// ============================================

userStatuses.forEach((status) => {
	test.beforeEach(async ({ mockApi }) => {
		await mockApi.get('/mock/purge');
	});

	// ============================================
	// useOktaClassic Tests
	// ============================================
	test.describe(`Given I am a ${status || 'nonexistent'} user - useOktaClassic`, () => {
		// ------------------------------------------
		// /reset-password
		// ------------------------------------------
		test.describe('When I submit the form on /reset-password', () => {
			test.beforeEach(async ({ page, context }) => {
				await setEncryptedStateCookie(context, {});
				await page.goto('/reset-password?useOktaClassic=true');
				await page.locator('input[name="email"]').fill('example@example.com');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userNotFoundError.code,
								body: userNotFoundError.response,
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});
					break;

				case 'ACTIVE':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: response,
							},
						});
						// forgotPassword()
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/credentials/forgot_password',
								status: 200,
								body: {
									resetPasswordUrl:
										'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
								},
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});

					test("Then I should be shown the 'Check your inbox' page for social user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForSocialUserPasswordReset(mockApi);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});
					break;

				case 'PROVISIONED':
				case 'STAGED':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };
						const activationResponse = {
							activationUrl: 'https://example.com/activate/token',
							activationToken: 'fake-activation-token',
						};
						// Mock reactivate endpoint (for PROVISIONED users)
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/reactivate',
								status: 200,
								body: activationResponse,
							},
						});
						// Mock activate endpoint (for STAGED users)
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/activate',
								status: 200,
								body: activationResponse,
							},
						});
						// Mock getting user by email
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: response,
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});
					break;

				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
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
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});
					break;
			}
		});

		// ------------------------------------------
		// /reset-password/email-sent
		// ------------------------------------------
		test.describe('When I submit the form on /reset-password/email-sent', () => {
			test.beforeEach(async ({ page, context }) => {
				await setEncryptedStateCookie(context, {
					email: 'example@example.com',
				});
				await page.goto('/reset-password/email-sent?useOktaClassic=true');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userNotFoundError.code,
								body: userNotFoundError.response,
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});
					break;

				case 'ACTIVE':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: response,
							},
						});
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/credentials/forgot_password',
								status: 200,
								body: {
									resetPasswordUrl:
										'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
								},
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});

					test("Then I should be shown the 'Check your inbox' page for social user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForSocialUserPasswordReset(mockApi);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});
					break;

				case 'PROVISIONED':
				case 'STAGED':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };
						const activationResponse = {
							activationUrl: 'https://example.com/activate/token',
							activationToken: 'fake-activation-token',
						};
						// Mock reactivate endpoint (for PROVISIONED users)
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/reactivate',
								status: 200,
								body: activationResponse,
							},
						});
						// Mock activate endpoint (for STAGED users)
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/activate',
								status: 200,
								body: activationResponse,
							},
						});
						// Mock getting user by email
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: response,
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});
					break;

				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
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
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});
					break;
			}
		});

		// ------------------------------------------
		// /reset-password/resend
		// ------------------------------------------
		test.describe('When I submit the form on /reset-password/resend', () => {
			test.beforeEach(async ({ page }) => {
				await page.goto('/reset-password/resend?useOktaClassic=true');
				await page.locator('input[name="email"]').fill('example@example.com');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userNotFoundError.code,
								body: userNotFoundError.response,
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});
					break;

				case 'ACTIVE':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: response,
							},
						});
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/credentials/forgot_password',
								status: 200,
								body: {
									resetPasswordUrl:
										'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
								},
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});

					test("Then I should be shown the 'Check your inbox' page for social user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForSocialUserPasswordReset(mockApi);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});
					break;

				case 'PROVISIONED':
				case 'STAGED':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };
						const activationResponse = {
							activationUrl: 'https://example.com/activate/token',
							activationToken: 'fake-activation-token',
						};
						// Mock reactivate endpoint (for PROVISIONED users)
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/reactivate',
								status: 200,
								body: activationResponse,
							},
						});
						// Mock activate endpoint (for STAGED users)
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/activate',
								status: 200,
								body: activationResponse,
							},
						});
						// Mock getting user by email
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: response,
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});
					break;

				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
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
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});
					break;
			}
		});

		// ------------------------------------------
		// /reset-password/expired
		// ------------------------------------------
		test.describe('When I submit the form on /reset-password/expired', () => {
			test.beforeEach(async ({ page }) => {
				await page.goto('/reset-password/expired?useOktaClassic=true');
				await page.locator('input[name="email"]').fill('example@example.com');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userNotFoundError.code,
								body: userNotFoundError.response,
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});
					break;

				case 'ACTIVE':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: response,
							},
						});
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/credentials/forgot_password',
								status: 200,
								body: {
									resetPasswordUrl:
										'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
								},
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});

					test("Then I should be shown the 'Check your inbox' page for social user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForSocialUserPasswordReset(mockApi);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});
					break;

				case 'PROVISIONED':
				case 'STAGED':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };
						const activationResponse = {
							activationUrl: 'https://example.com/activate/token',
							activationToken: 'fake-activation-token',
						};
						// Mock reactivate endpoint (for PROVISIONED users)
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/reactivate',
								status: 200,
								body: activationResponse,
							},
						});
						// Mock activate endpoint (for STAGED users)
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/activate',
								status: 200,
								body: activationResponse,
							},
						});
						// Mock getting user by email
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: response,
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});
					break;

				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
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
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPage(page);
					});
					break;
			}
		});

		// ------------------------------------------
		// /set-password/email-sent
		// ------------------------------------------
		test.describe('When I submit the form on /set-password/email-sent', () => {
			test.beforeEach(async ({ page, context }) => {
				await setEncryptedStateCookie(context, {
					email: 'example@example.com',
				});
				await page.goto('/set-password/email-sent?useOktaClassic=true');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userNotFoundError.code,
								body: userNotFoundError.response,
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyInRegularEmailSentPage(page);
					});
					break;

				case 'ACTIVE':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: response,
							},
						});
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/credentials/forgot_password',
								status: 200,
								body: {
									resetPasswordUrl:
										'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
								},
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyInRegularEmailSentPage(page);
					});

					test("Then I should be shown the 'Check your inbox' page for social user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForSocialUserPasswordReset(mockApi);
						await page.locator('button[type=submit]').click();
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
						const activationResponse = {
							activationUrl: 'https://example.com/activate/token',
							activationToken: 'fake-activation-token',
						};
						// Mock reactivate endpoint (for PROVISIONED users)
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/reactivate',
								status: 200,
								body: activationResponse,
							},
						});
						// Mock activate endpoint (for STAGED users)
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/activate',
								status: 200,
								body: activationResponse,
							},
						});
						// Mock getting user by email
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: response,
							},
						});
						await page.locator('button[type=submit]').click();
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
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
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
						await page.locator('button[type=submit]').click();
						await verifyInRegularEmailSentPage(page);
					});
					break;
			}
		});

		// ------------------------------------------
		// /set-password/resend
		// ------------------------------------------
		test.describe('When I submit the form on /set-password/resend', () => {
			test.beforeEach(async ({ page }) => {
				await page.goto('/set-password/resend?useOktaClassic=true');
				await page.locator('input[name="email"]').fill('example@example.com');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userNotFoundError.code,
								body: userNotFoundError.response,
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyInRegularEmailSentPage(page);
					});
					break;

				case 'ACTIVE':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: response,
							},
						});
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/credentials/forgot_password',
								status: 200,
								body: {
									resetPasswordUrl:
										'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
								},
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyInRegularEmailSentPage(page);
					});

					test("Then I should be shown the 'Check your inbox' page for social user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForSocialUserPasswordReset(mockApi);
						await page.locator('button[type=submit]').click();
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
						const activationResponse = {
							activationUrl: 'https://example.com/activate/token',
							activationToken: 'fake-activation-token',
						};
						// Mock reactivate endpoint (for PROVISIONED users)
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/reactivate',
								status: 200,
								body: activationResponse,
							},
						});
						// Mock activate endpoint (for STAGED users)
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/activate',
								status: 200,
								body: activationResponse,
							},
						});
						// Mock getting user by email
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: response,
							},
						});
						await page.locator('button[type=submit]').click();
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
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
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
						await page.locator('button[type=submit]').click();
						await verifyInRegularEmailSentPage(page);
					});
					break;
			}
		});

		// ------------------------------------------
		// /set-password/expired
		// ------------------------------------------
		test.describe('When I submit the form on /set-password/expired', () => {
			test.beforeEach(async ({ page }) => {
				await page.goto('/set-password/expired?useOktaClassic=true');
				await page.locator('input[name="email"]').fill('example@example.com');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userNotFoundError.code,
								body: userNotFoundError.response,
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyInRegularEmailSentPage(page);
					});
					break;

				case 'ACTIVE':
					test("Then I should be shown the 'Check your inbox' page", async ({
						mockApi,
						page,
					}) => {
						const response = { ...userResponse.response, status };
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: response,
							},
						});
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/credentials/forgot_password',
								status: 200,
								body: {
									resetPasswordUrl:
										'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
								},
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyInRegularEmailSentPage(page);
					});

					test("Then I should be shown the 'Check your inbox' page for social user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForSocialUserPasswordReset(mockApi);
						await page.locator('button[type=submit]').click();
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
						const activationResponse = {
							activationUrl: 'https://example.com/activate/token',
							activationToken: 'fake-activation-token',
						};
						// Mock reactivate endpoint (for PROVISIONED users)
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/reactivate',
								status: 200,
								body: activationResponse,
							},
						});
						// Mock activate endpoint (for STAGED users)
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*/lifecycle/activate',
								status: 200,
								body: activationResponse,
							},
						});
						// Mock getting user by email
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
								status: userResponse.code,
								body: response,
							},
						});
						await page.locator('button[type=submit]').click();
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
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/[^/]+$',
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
						await page.locator('button[type=submit]').click();
						await verifyInRegularEmailSentPage(page);
					});
					break;
			}
		});
	});

	// ============================================
	// Passcodes Tests
	// ============================================
	test.describe(`Given I am a ${status || 'nonexistent'} user - passcodes`, () => {
		// ------------------------------------------
		// /reset-password (passcodes)
		// ------------------------------------------
		test.describe('When I submit the form on /reset-password', () => {
			test.beforeEach(async ({ page, context }) => {
				await setEncryptedStateCookie(context, {});
				await page.goto('/reset-password');
				await page.locator('input[name="email"]').fill('example@example.com');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userNotFoundError.code,
								body: userNotFoundError.response,
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;

				case 'ACTIVE':
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersWithEmailPasswordFactors(
							mockApi,
							status,
						);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});

					test("Then I should be shown the 'Enter your one-time code' page for social user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersEmailFactorOnly(mockApi, status);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});

					test("Then I should be shown the 'Enter your one-time code' page for password only authenticator user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersPasswordFactorOnly(mockApi, status);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;

				case 'PROVISIONED':
				case 'STAGED':
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForNonActiveUsers(mockApi, status);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;
			}
		});

		// ------------------------------------------
		// /reset-password/email-sent (passcodes)
		// ------------------------------------------
		test.describe('When I submit the form on /reset-password/email-sent', () => {
			test.beforeEach(async ({ page, context }) => {
				await setEncryptedStateCookie(context, {
					stateHandle: 'test-state-handle',
					stateHandleExpiresAt: new Date(
						Date.now() + 1000 * 60 * 30,
					).toISOString(),
					email: 'test@example.com',
				});
				await page.goto('/reset-password/email-sent');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userNotFoundError.code,
								body: userNotFoundError.response,
							},
						});
						await page.getByText('send again').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;

				case 'ACTIVE':
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersWithEmailPasswordFactors(
							mockApi,
							status,
						);
						await page.getByText('send again').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});

					test("Then I should be shown the 'Enter your one-time code' page for social user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersEmailFactorOnly(mockApi, status);
						await page.getByText('send again').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});

					test("Then I should be shown the 'Enter your one-time code' page for password only authenticator user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersPasswordFactorOnly(mockApi, status);
						await page.getByText('send again').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;

				case 'PROVISIONED':
				case 'STAGED':
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForNonActiveUsers(mockApi, status);
						await page.getByText('send again').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;
			}
		});

		// ------------------------------------------
		// /reset-password/resend (passcodes)
		// ------------------------------------------
		test.describe('When I submit the form on /reset-password/resend', () => {
			test.beforeEach(async ({ page, context }) => {
				await setEncryptedStateCookie(context, {});
				await page.goto('/reset-password/resend');
				await page.locator('input[name="email"]').fill('example@example.com');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userNotFoundError.code,
								body: userNotFoundError.response,
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;

				case 'ACTIVE':
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersWithEmailPasswordFactors(
							mockApi,
							status,
						);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});

					test("Then I should be shown the 'Enter your one-time code' page for social user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersEmailFactorOnly(mockApi, status);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});

					test("Then I should be shown the 'Enter your one-time code' page for password only authenticator user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersPasswordFactorOnly(mockApi, status);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;

				case 'PROVISIONED':
				case 'STAGED':
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForNonActiveUsers(mockApi, status);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;
			}
		});

		// ------------------------------------------
		// /reset-password/expired (passcodes)
		// ------------------------------------------
		test.describe('When I submit the form on /reset-password/expired', () => {
			test.beforeEach(async ({ page, context }) => {
				await setEncryptedStateCookie(context, {});
				await page.goto('/reset-password/expired');
				await page.locator('input[name="email"]').fill('example@example.com');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userNotFoundError.code,
								body: userNotFoundError.response,
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;

				case 'ACTIVE':
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersWithEmailPasswordFactors(
							mockApi,
							status,
						);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});

					test("Then I should be shown the 'Enter your one-time code' page for social user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersEmailFactorOnly(mockApi, status);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});

					test("Then I should be shown the 'Enter your one-time code' page for password only authenticator user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersPasswordFactorOnly(mockApi, status);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;

				case 'PROVISIONED':
				case 'STAGED':
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForNonActiveUsers(mockApi, status);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;
			}
		});

		// ------------------------------------------
		// /set-password/resend (passcodes)
		// ------------------------------------------
		test.describe('When I submit the form on /set-password/resend', () => {
			test.beforeEach(async ({ page, context }) => {
				await setEncryptedStateCookie(context, {});
				await page.goto('/set-password/resend');
				await page.locator('input[name="email"]').fill('example@example.com');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userNotFoundError.code,
								body: userNotFoundError.response,
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;

				case 'ACTIVE':
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersWithEmailPasswordFactors(
							mockApi,
							status,
						);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});

					test("Then I should be shown the 'Enter your one-time code' page for social user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersEmailFactorOnly(mockApi, status);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});

					test("Then I should be shown the 'Enter your one-time code' page for password only authenticator user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersPasswordFactorOnly(mockApi, status);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;

				case 'PROVISIONED':
				case 'STAGED':
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForNonActiveUsers(mockApi, status);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;
			}
		});

		// ------------------------------------------
		// /set-password/expired (passcodes)
		// ------------------------------------------
		test.describe('When I submit the form on /set-password/expired', () => {
			test.beforeEach(async ({ page, context }) => {
				await setEncryptedStateCookie(context, {});
				await page.goto('/set-password/expired');
				await page.locator('input[name="email"]').fill('example@example.com');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await mockApi.post('/mock/permanent-pattern', {
							data: {
								pattern: '/api/v1/users/.*',
								status: userNotFoundError.code,
								body: userNotFoundError.response,
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;

				case 'ACTIVE':
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersWithEmailPasswordFactors(
							mockApi,
							status,
						);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});

					test("Then I should be shown the 'Enter your one-time code' page for social user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersEmailFactorOnly(mockApi, status);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});

					test("Then I should be shown the 'Enter your one-time code' page for password only authenticator user", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForActiveUsersPasswordFactorOnly(mockApi, status);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;

				case 'PROVISIONED':
				case 'STAGED':
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					test("Then I should be shown the 'Enter your one-time code' page", async ({
						mockApi,
						page,
					}) => {
						await setupMocksForNonActiveUsers(mockApi, status);
						await page.locator('button[type=submit]').click();
						await verifyIn2MinutesEmailSentPagePasscodes(page);
					});
					break;
			}
		});
	});

	// ============================================
	// Generic Error Handling
	// ============================================
	test.describe(`generic error handling - ${status}`, () => {
		test('shows a generic error when something goes wrong', async ({
			mockApi,
			page,
		}) => {
			await page.goto('/reset-password');
			await page.locator('input[name="email"]').fill('test@example.com');

			const response = { ...userResponse.response, status };
			await mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/api/v1/users/[^/]+$',
					status: userResponse.code,
					body: response,
				},
			});
			await mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/api/v1/users/.*/credentials/forgot_password',
					status: 403,
					body: {
						errorCode: 'E0000006',
						errorSummary:
							'You do not have permission to perform the requested action',
						errorLink: 'E0000006',
						errorId: 'errorId',
						errorCauses: [],
					},
				},
			});

			await page.locator('button[type=submit]').click();
			await expect(
				page.getByText('Sorry, something went wrong. Please try again.'),
			).toBeVisible();
		});
	});
});
