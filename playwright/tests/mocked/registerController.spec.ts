import { expect, Page } from '@playwright/test';
import { test } from '../../fixtures/mockedApiRequest';
import userStatuses from '../../../cypress/support/okta/userStatuses';
import userResponse from '../../../cypress/fixtures/okta-responses/success/user.json';
import idxInteractResponse from '../../../cypress/fixtures/okta-responses/success/idx-interact-response.json';
import idxIntrospectDefaultResponse from '../../../cypress/fixtures/okta-responses/success/idx-introspect-default-response.json';
import idxEnrollResponse from '../../../cypress/fixtures/okta-responses/success/idx-enroll-response.json';
import idxEnrollNewResponse from '../../../cypress/fixtures/okta-responses/success/idx-enroll-new-response.json';
import idxEnrollNewSelectAuthenticatorResponse from '../../../cypress/fixtures/okta-responses/success/idx-enroll-new-response-select-authenticator.json';
import idxEnrollNewExistingUserResponse from '../../../cypress/fixtures/okta-responses/error/idx-enroll-new-existing-user-response.json';
import { identifyResponse } from '../../../cypress/fixtures/okta-responses/success/idx-identify-response';
import idxChallengeResponseEmail from '../../../cypress/fixtures/okta-responses/success/idx-challenge-response-email.json';
import idxChallengeResponsePassword from '../../../cypress/fixtures/okta-responses/success/idx-challenge-response-password.json';
import idxChallengeAnswerPasswordEnrollEmailResponse from '../../../cypress/fixtures/okta-responses/success/idx-challenge-answer-password-enroll-email-response.json';
import { dangerouslySetPlaceholderPasswordMocks } from '../../helpers/api/placeholder-password-mock';

const baseIdxPasscodeRegistrationMocks = async (mockApi) => {
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

export const idxPasscodeExistingUserMocks = async (mockApi) => {
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

const verifyInPasscodeEmailSentPage = async (page: Page) => {
	await expect(page.getByText('Enter your one-time code')).toBeVisible();
	await expect(page.getByText('send again')).toBeVisible();
};

userStatuses.forEach((status) => {
	test.beforeEach(async ({ mockApi }) => {
		await mockApi.get('/mock/purge');
	});
	test.describe(`Given I am a ${status || 'nonexistent'} user`, () => {
		test.describe('When I submit the form on /register', () => {
			test.beforeEach(async ({ page }) => {
				await page.goto('/register/email');
				await page.locator('input[name="email"]').fill('example@example.com');
			});

			switch (status) {
				case false:
					test("Then I should be shown the 'Enter your one-time code' page", async ({
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
						await page.locator('button[type=submit]').click();
						await verifyInPasscodeEmailSentPage(page);
					});
					break;
				case 'ACTIVE':
					test("Then I should be shown the 'Enter your code' page if I have a validated email (ACTIVE - email + password)", async ({
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
								path: '/api/v1/users/.*',
								status: userResponse.code,
								body: responseWithPassword,
							},
						});

						await idxPasscodeExistingUserMocks(mockApi);
						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/identity',
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

						await page.locator('button[type=submit]').click();
						await verifyInPasscodeEmailSentPage(page);
					});

					test("Then I should be shown the 'Enter your code' page if I have a validated email but no password (ACTIVE - social or passwordless)", async ({
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
								path: '/api/v1/users/.*',
								status: userResponse.code,
								body: response,
							},
						});

						await idxPasscodeExistingUserMocks(mockApi);

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/identity',
								status: 200,
								body: identifyResponse(true, false),
							},
						});

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/challenge',
								status: idxChallengeResponseEmail.code,
								body: idxChallengeResponseEmail.response,
							},
						});
						await page.locator('button[type=submit]').click();
						await verifyInPasscodeEmailSentPage(page);
					});

					test("Then I should be shown the 'Check your inbox' page if I don't have a validated email and do have a password set (ACTIVE - password only, email not verified)", async ({
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
								path: '/idp/idx/credential/enroll',
								status: userResponse.code,
								body: responseWithPassword,
							},
						});

						await idxPasscodeExistingUserMocks(mockApi);
						await mockApi.post('/mock/permanent', {
							data: {
								path: '/api/users/.*',
								status: 200,
								body: identifyResponse(false, true),
							},
						});

						await dangerouslySetPlaceholderPasswordMocks(
							mockApi,
							'example@example.com',
						);
						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/identify',
								status: idxChallengeResponsePassword.code,
								body: idxChallengeResponsePassword.response,
							},
						});

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/challenge',
								status: idxChallengeResponsePassword.code,
								body: idxChallengeResponsePassword.response,
							},
						});

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/challenge',
								status: idxChallengeAnswerPasswordEnrollEmailResponse.code,
								body: idxChallengeAnswerPasswordEnrollEmailResponse.response,
							},
						});

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/challenge/answer',
								status: idxChallengeResponseEmail.code,
								body: idxChallengeResponseEmail.response,
							},
						});

						await page.locator('button[type=submit]').click();
						await verifyInPasscodeEmailSentPage(page);
					});
					break;
				case 'PROVISIONED':
				case 'STAGED':
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
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
						await mockApi.post('/mock/permanent', {
							data: {
								path: '/api/v1/users/.*',
								status: userResponse.code,
								body: {
									...response,
									status,
								},
							},
						});

						await mockApi.post('/mock/permanent', {
							data: {
								path: '/api/v1/users/.*/lifecycle/activate',
								status: 200,
								body: {},
							},
						});

						await dangerouslySetPlaceholderPasswordMocks(
							mockApi,
							'test@example.com',
						);
						await mockApi.post('/mock/permanent', {
							data: {
								path: '/api/v1/users/.*',
								status: 200,
								body: { ...userResponse.response, status: 'ACTIVE' },
							},
						});

						await idxPasscodeExistingUserMocks(mockApi);
						await mockApi.post('/mock/permanent', {
							data: {
								path: '/idp/idx/identity',
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

						await page.locator('button[type=submit]').click();
						await verifyInPasscodeEmailSentPage(page);
					});
					break;
			}
		});
	});
});
