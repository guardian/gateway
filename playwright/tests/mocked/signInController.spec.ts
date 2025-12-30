import { APIRequestContext, expect } from '@playwright/test';
import { test } from '../../fixtures/mockedApiRequest';
import authenticationFailedError from '../../../cypress/fixtures/okta-responses/error/authentication-failed.json';
import validUserResponse from '../../../cypress/fixtures/okta-responses/success/valid-user.json';
import validUserGroupsResponse from '../../../cypress/fixtures/okta-responses/success/valid-user-groups.json';
import { identifyResponse } from '../../../cypress/fixtures/okta-responses/success/idx-identify-response';
import idxChallengeResponsePassword from '../../../cypress/fixtures/okta-responses/success/idx-challenge-response-password.json';
import idxChallengeAnswerPasswordUserResponse from '../../../cypress/fixtures/okta-responses/success/idx-challenge-answer-password-user-response.json';
import idxChallengeAnswerPassword401Response from '../../../cypress/fixtures/okta-responses/error/idx-challenge-answer-password-401-response.json';
import userResponse from '../../../cypress/fixtures/okta-responses/success/user.json';
import idxInteractResponse from '../../../cypress/fixtures/okta-responses/success/idx-interact-response.json';
import idxIntrospectDefaultResponse from '../../../cypress/fixtures/okta-responses/success/idx-introspect-default-response.json';

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

test.describe('When I submit the form on /signin - useOktaClassic', () => {
	test.beforeEach(async ({ mockApi, page }) => {
		await mockApi.get('/mock/purge');
		await page.goto('/signin?useOktaClassic=true');
		await page.locator('input[name="email"]').fill('example@example.com');
		await page.locator('input[name="password"]').fill('password');
	});

	//This is expected for non existent, non active users or when the email and password are incorrect
	test('if okta authentication fails then I should be shown an "Email or password incorrect" error. ', async ({
		mockApi,
		page,
	}) => {
		await mockApi.post('/mock/permanent', {
			data: {
				path: '/api/v1/authn',
				status: authenticationFailedError.code,
				body: authenticationFailedError.response,
			},
		});
		await page.locator('button[type=submit]').click();
		await expect(
			page.getByText('Email and password don’t match'),
		).toBeVisible();
	});

	test('if okta authentication succeeds then I should be signed in.', async ({
		mockApi,
		page,
	}) => {
		await Promise.all([
			mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn',
					status: validUserResponse.code,
					body: validUserResponse.response,
				},
			}),
			mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/api/v1/users/.*/groups',
					status: validUserGroupsResponse.code,
					body: validUserGroupsResponse.response,
				},
			}),
			mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/oauth2/.*/v1/authorize',
					status: 200,
					body: 'OAuth',
				},
			}),
		]);

		await page.locator('button[type=submit]').click();
		await expect(page.getByText('OAuth')).toBeVisible();
	});
});

test.describe('When I submit the form on /signin - idx api', () => {
	test.beforeEach(async ({ mockApi, page }) => {
		await mockApi.get('/mock/purge');
		await page.goto('/signin?usePasswordSignIn=true');
		await page.locator('input[name="email"]').fill('example@example.com');
		await page.locator('input[name="password"]').fill('password');
	});

	//This is expected for non existent, non active users or when the email and password are incorrect
	test('if okta authentication fails then I should be shown an "Email or password incorrect" error. ', async ({
		mockApi,
		page,
	}) => {
		const response = { ...userResponse.response, status: 'ACTIVE' };
		await Promise.all([
			mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/api/v1/users/[^/]+$',
					status: userResponse.code,
					body: response,
				},
			}),
			mockApi.post('/mock/permanent', {
				data: {
					path: '/idp/idx/identify',
					status: 200,
					body: identifyResponse(true, true),
				},
			}),
			mockApi.post('/mock/permanent', {
				data: {
					path: '/idp/idx/challenge',
					status: idxChallengeResponsePassword.code,
					body: idxChallengeResponsePassword.response,
				},
			}),
			mockApi.post('/mock/permanent', {
				data: {
					path: '/idp/idx/challenge/answer',
					status: idxChallengeAnswerPassword401Response.code,
					body: idxChallengeAnswerPassword401Response.response,
				},
			}),
			// submitPassword calls introspect with stateHandle as a validation step
			mockApi.post('/mock/permanent-body', {
				data: {
					path: '/idp/idx/introspect',
					bodyMatch: { stateHandle: '02.id.state~c.handle' },
					status: 200,
					body: idxChallengeResponsePassword.response,
				},
			}),
		]);
		await baseIdxPasscodeResetPasswordMocks(mockApi);
		await page.locator('button[type=submit]').click();
		await expect(
			page.getByText('Email and password don’t match'),
		).toBeVisible();
	});

	test('if okta authentication succeeds then I should be signed in.', async ({
		mockApi,
		page,
	}) => {
		const response = { ...userResponse.response, status: 'ACTIVE' };
		await Promise.all([
			mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/api/v1/users/[^/]+$',
					status: userResponse.code,
					body: response,
				},
			}),
			mockApi.post('/mock/permanent', {
				data: {
					path: '/idp/idx/identify',
					status: 200,
					body: identifyResponse(true, true),
				},
			}),
			mockApi.post('/mock/permanent', {
				data: {
					path: '/idp/idx/challenge',
					status: idxChallengeResponsePassword.code,
					body: idxChallengeResponsePassword.response,
				},
			}),
			mockApi.post('/mock/permanent', {
				data: {
					path: '/idp/idx/challenge/answer',
					status: idxChallengeAnswerPasswordUserResponse.code,
					body: idxChallengeAnswerPasswordUserResponse.response,
				},
			}),
			mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/api/v1/users/.*/groups',
					status: validUserGroupsResponse.code,
					body: validUserGroupsResponse.response,
				},
			}),
			// submitPassword calls introspect with stateHandle as a validation step
			mockApi.post('/mock/permanent-body', {
				data: {
					path: '/idp/idx/introspect',
					bodyMatch: { stateHandle: '02.id.state~c.handle' },
					status: 200,
					body: idxChallengeResponsePassword.response,
				},
			}),
		]);
		await baseIdxPasscodeResetPasswordMocks(mockApi);

		// we can't actually check the authorization code flow
		// so simply verify the redirect to /login/token/redirect happens
		const redirectPromise = page.waitForRequest((request) =>
			request.url().includes('/login/token/redirect'),
		);

		await page.locator('button[type=submit]').click();
		const redirectRequest = await redirectPromise;
		expect(redirectRequest.url()).toContain('/login/token/redirect');
		expect(redirectRequest.url()).toContain('stateToken=');
	});
});

test.describe('When I submit the form on /reauthenticate - useOktaClassic', () => {
	test.beforeEach(async ({ mockApi, page }) => {
		await mockApi.get('/mock/purge');
		await page.goto('/reauthenticate?useOktaClassic=true');
		await page.locator('input[name="email"]').fill('example@example.com');
		await page.locator('input[name="password"]').fill('password');
	});

	//This is expected for non existent, non active users or when the email and password are incorrect
	test('If okta authentication fails then I should be shown an "Email or password incorrect" error.', async ({
		mockApi,
		page,
	}) => {
		await mockApi.post('/mock/permanent', {
			data: {
				path: '/api/v1/authn',
				status: authenticationFailedError.code,
				body: authenticationFailedError.response,
			},
		});
		await page.locator('button[type=submit]').click();
		await expect(
			page.getByText('Email and password don’t match'),
		).toBeVisible();
	});

	test('If okta authentication succeeeds then I should be signed in.', async ({
		mockApi,
		page,
	}) => {
		await Promise.all([
			mockApi.post('/mock/permanent', {
				data: {
					path: '/api/v1/authn',
					status: validUserResponse.code,
					body: validUserResponse.response,
				},
			}),
			mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/api/v1/users/.*/groups',
					status: validUserGroupsResponse.code,
					body: validUserGroupsResponse.response,
				},
			}),
			mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/oauth2/.*/v1/authorize',
					status: 200,
					body: 'OAuth',
				},
			}),
		]);

		await page.locator('button[type=submit]').click();
		await expect(page.getByText('OAuth')).toBeVisible();
	});
});

test.describe('When I submit the form on /reauthenticate - idx api', () => {
	test.beforeEach(async ({ mockApi, page }) => {
		await mockApi.get('/mock/purge');
		await page.goto('/reauthenticate?usePasswordSignIn=true');
		await page.locator('input[name="email"]').fill('example@example.com');
		await page.locator('input[name="password"]').fill('password');
	});

	//This is expected for non existent, non active users or when the email and password are incorrect
	test('if okta authentication fails then I should be shown an "Email or password incorrect" error. ', async ({
		mockApi,
		page,
	}) => {
		const response = { ...userResponse.response, status: 'ACTIVE' };
		await Promise.all([
			mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/api/v1/users/[^/]+$',
					status: userResponse.code,
					body: response,
				},
			}),
			mockApi.post('/mock/permanent', {
				data: {
					path: '/idp/idx/identify',
					status: 200,
					body: identifyResponse(true, true),
				},
			}),
			mockApi.post('/mock/permanent', {
				data: {
					path: '/idp/idx/challenge',
					status: idxChallengeResponsePassword.code,
					body: idxChallengeResponsePassword.response,
				},
			}),
			mockApi.post('/mock/permanent', {
				data: {
					path: '/idp/idx/challenge/answer',
					status: idxChallengeAnswerPassword401Response.code,
					body: idxChallengeAnswerPassword401Response.response,
				},
			}),
			// submitPassword calls introspect with stateHandle as a validation step
			mockApi.post('/mock/permanent-body', {
				data: {
					path: '/idp/idx/introspect',
					bodyMatch: { stateHandle: '02.id.state~c.handle' },
					status: 200,
					body: idxChallengeResponsePassword.response,
				},
			}),
		]);
		await baseIdxPasscodeResetPasswordMocks(mockApi);
		await page.locator('button[type=submit]').click();
		await expect(
			page.getByText('Email and password don’t match'),
		).toBeVisible();
	});

	test('if okta authentication succeeds then I should be signed in.', async ({
		mockApi,
		page,
	}) => {
		const response = { ...userResponse.response, status: 'ACTIVE' };
		await Promise.all([
			mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/api/v1/users/[^/]+$',
					status: userResponse.code,
					body: response,
				},
			}),
			mockApi.post('/mock/permanent', {
				data: {
					path: '/idp/idx/identify',
					status: 200,
					body: identifyResponse(true, true),
				},
			}),
			mockApi.post('/mock/permanent', {
				data: {
					path: '/idp/idx/challenge',
					status: idxChallengeResponsePassword.code,
					body: idxChallengeResponsePassword.response,
				},
			}),
			mockApi.post('/mock/permanent', {
				data: {
					path: '/idp/idx/challenge/answer',
					status: idxChallengeAnswerPasswordUserResponse.code,
					body: idxChallengeAnswerPasswordUserResponse.response,
				},
			}),
			mockApi.post('/mock/permanent-pattern', {
				data: {
					pattern: '/api/v1/users/.*/groups',
					status: validUserGroupsResponse.code,
					body: validUserGroupsResponse.response,
				},
			}),
			// submitPassword calls introspect with stateHandle as a validation step
			mockApi.post('/mock/permanent-body', {
				data: {
					path: '/idp/idx/introspect',
					bodyMatch: { stateHandle: '02.id.state~c.handle' },
					status: 200,
					body: idxChallengeResponsePassword.response,
				},
			}),
		]);
		await baseIdxPasscodeResetPasswordMocks(mockApi);

		// we can't actually check the authorization code flow
		// so simply verify the redirect to /login/token/redirect happens
		const redirectPromise = page.waitForRequest((request) =>
			request.url().includes('/login/token/redirect'),
		);

		await page.locator('button[type=submit]').click();
		const redirectRequest = await redirectPromise;
		expect(redirectRequest.url()).toContain('/login/token/redirect');
		expect(redirectRequest.url()).toContain('stateToken=');
	});
});
