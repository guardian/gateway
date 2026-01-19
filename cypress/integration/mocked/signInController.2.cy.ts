import authenticationFailedError from '../../fixtures/okta-responses/error/authentication-failed.json';
import validUserResponse from '../../fixtures/okta-responses/success/valid-user.json';
import validUserGroupsResponse from '../../fixtures/okta-responses/success/valid-user-groups.json';
import { baseIdxPasscodeResetPasswordMocks } from './resetPasswordController.4.cy';
import { identifyResponse } from '../../fixtures/okta-responses/success/idx-identify-response';
import idxChallengeResponsePassword from '../../fixtures/okta-responses/success/idx-challenge-response-password.json';
import idxChallengeAnswerPasswordUserResponse from '../../fixtures/okta-responses/success/idx-challenge-answer-password-user-response.json';
import idxChallengeAnswerPassword401Response from '../..//fixtures/okta-responses/error/idx-challenge-answer-password-401-response.json';
import userResponse from '../../fixtures/okta-responses/success/user.json';

beforeEach(() => {
	cy.on('uncaught:exception', (err) => {
		// eslint-disable-next-line no-console
		console.log('uncaught exception', err);
	});
	cy.mockPurge();
	cy.intercept('GET', 'https://ophan.theguardian.com/**', {
		statusCode: 204,
		body: {},
	});
});
context('When I submit the form on /signin - useOktaClassic', () => {
	beforeEach(() => {
		cy.visit(`/signin?useOktaClassic=true`);
		cy.get('input[name="email"]').type('example@example.com');
		cy.get('input[name="password"]').type('password');
	});
	//This is expected for non existent, non active users or when the email and password are incorrect
	specify(
		'if okta authentication fails then I should be shown an "Email or password incorrect" error. ',
		() => {
			cy.mockNext(
				authenticationFailedError.code,
				authenticationFailedError.response,
			);
			cy.get('button[type=submit]').click();
			cy.contains('Email and password don’t match');
		},
	);
	specify('if okta authentication succeeds then I should be signed in.', () => {
		cy.mockNext(validUserResponse.code, validUserResponse.response);
		cy.mockNext(validUserGroupsResponse.code, validUserGroupsResponse.response);

		cy.get('button[type=submit]').click();
		// we can't actually check the authorization code flow
		// so simply intercept the request and verify that it contains
		// the mocked response
		cy.intercept(
			`http://localhost:9000/oauth2/${Cypress.env(
				'OKTA_CUSTOM_OAUTH_SERVER',
			)}/v1/authorize*`,
			'OAuth',
		);
		cy.contains('OAuth');
	});
});

context('When I submit the form on /signin - idx api', () => {
	beforeEach(() => {
		cy.visit(`/signin?usePasswordSignIn=true`);
		cy.get('input[name="email"]').type('example@example.com');
		cy.get('input[name="password"]').type('password');
	});
	//This is expected for non existent, non active users or when the email and password are incorrect
	specify(
		'if okta authentication fails then I should be shown an "Email or password incorrect" error. ',
		() => {
			const response = { ...userResponse.response, status: 'ACTIVE' };
			cy.mockNext(userResponse.code, response);
			baseIdxPasscodeResetPasswordMocks();
			cy.mockNext(200, identifyResponse(true, true));
			cy.mockNext(
				idxChallengeResponsePassword.code,
				idxChallengeResponsePassword.response,
			);
			cy.mockNext(
				idxChallengeAnswerPassword401Response.code,
				idxChallengeAnswerPassword401Response.response,
			);
			cy.get('button[type=submit]').click();
			cy.contains('Email and password don’t match');
		},
	);
	specify('if okta authentication succeeds then I should be signed in.', () => {
		const response = { ...userResponse.response, status: 'ACTIVE' };
		cy.mockNext(userResponse.code, response);
		baseIdxPasscodeResetPasswordMocks();
		cy.mockNext(200, identifyResponse(true, true));
		cy.mockNext(
			idxChallengeResponsePassword.code,
			idxChallengeResponsePassword.response,
		);
		cy.mockNext(
			idxChallengeResponsePassword.code,
			idxChallengeResponsePassword.response,
		);
		cy.mockNext(
			idxChallengeAnswerPasswordUserResponse.code,
			idxChallengeAnswerPasswordUserResponse.response,
		);
		cy.mockNext(validUserGroupsResponse.code, validUserGroupsResponse.response);

		cy.get('button[type=submit]').click();
		// we can't actually check the authorization code flow
		// so simply intercept the request and verify that it contains
		// the mocked response
		cy.intercept(
			`https://profile.thegulocal.com/login/token/redirect?stateToken=02.id.state`,
			'OAuth',
		);
		cy.contains('OAuth');
	});
});

context('When I submit the form on /reauthenticate - useOktaClassic', () => {
	beforeEach(() => {
		cy.visit(`/reauthenticate?useOktaClassic=true`);
		cy.get('input[name="email"]').type('example@example.com');
		cy.get('input[name="password"]').type('password');
	});
	//This is expected for non existent, non active users or when the email and password are incorrect
	specify(
		'If okta authentication fails then I should be shown an "Email or password incorrect" error.',
		() => {
			cy.mockNext(
				authenticationFailedError.code,
				authenticationFailedError.response,
			);
			cy.get('button[type=submit]').click();
			cy.contains('Email and password don’t match');
		},
	);

	specify(
		'If okta authentication succeeeds then I should be signed in.',
		() => {
			cy.mockNext(validUserResponse.code, validUserResponse.response);
			cy.mockNext(
				validUserGroupsResponse.code,
				validUserGroupsResponse.response,
			);

			cy.get('button[type=submit]').click();
			// we can't actually check the authorization code flow
			// so simply intercept the request and verify that it contains
			// the mocked response
			cy.intercept(
				`http://localhost:9000/oauth2/${Cypress.env(
					'OKTA_CUSTOM_OAUTH_SERVER',
				)}/v1/authorize*`,
				'OAuth',
			);
			cy.contains('OAuth');
		},
	);
});

context('When I submit the form on /reauthenticate - idx api', () => {
	beforeEach(() => {
		cy.visit(`/reauthenticate?usePasswordSignIn=true`);
		cy.get('input[name="email"]').type('example@example.com');
		cy.get('input[name="password"]').type('password');
	});
	//This is expected for non existent, non active users or when the email and password are incorrect
	specify(
		'if okta authentication fails then I should be shown an "Email or password incorrect" error. ',
		() => {
			const response = { ...userResponse.response, status: 'ACTIVE' };
			cy.mockNext(userResponse.code, response);
			baseIdxPasscodeResetPasswordMocks();
			cy.mockNext(200, identifyResponse(true, true));
			cy.mockNext(
				idxChallengeResponsePassword.code,
				idxChallengeResponsePassword.response,
			);
			cy.mockNext(
				idxChallengeAnswerPassword401Response.code,
				idxChallengeAnswerPassword401Response.response,
			);
			cy.get('button[type=submit]').click();
			cy.contains('Email and password don’t match');
		},
	);
	specify('if okta authentication succeeds then I should be signed in.', () => {
		const response = { ...userResponse.response, status: 'ACTIVE' };
		cy.mockNext(userResponse.code, response);
		baseIdxPasscodeResetPasswordMocks();
		cy.mockNext(200, identifyResponse(true, true));
		cy.mockNext(
			idxChallengeResponsePassword.code,
			idxChallengeResponsePassword.response,
		);
		cy.mockNext(
			idxChallengeResponsePassword.code,
			idxChallengeResponsePassword.response,
		);
		cy.mockNext(
			idxChallengeAnswerPasswordUserResponse.code,
			idxChallengeAnswerPasswordUserResponse.response,
		);
		cy.mockNext(validUserGroupsResponse.code, validUserGroupsResponse.response);

		cy.get('button[type=submit]').click();
		// we can't actually check the authorization code flow
		// so simply intercept the request and verify that it contains
		// the mocked response
		cy.intercept(
			`https://profile.thegulocal.com/login/token/redirect?stateToken=02.id.state`,
			'OAuth',
		);
		cy.contains('OAuth');
	});
});
