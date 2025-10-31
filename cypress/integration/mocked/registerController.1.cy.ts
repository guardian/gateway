import userStatuses from '../../support/okta/userStatuses';
import userResponse from '../../fixtures/okta-responses/success/user.json';
import idxInteractResponse from '../../fixtures/okta-responses/success/idx-interact-response.json';
import idxIntrospectDefaultResponse from '../../fixtures/okta-responses/success/idx-introspect-default-response.json';
import idxEnrollResponse from '../../fixtures/okta-responses/success/idx-enroll-response.json';
import idxEnrollNewResponse from '../../fixtures/okta-responses/success/idx-enroll-new-response.json';
import idxEnrollNewSelectAuthenticatorResponse from '../../fixtures/okta-responses/success/idx-enroll-new-response-select-authenticator.json';
import idxEnrollNewExistingUserResponse from '../../fixtures/okta-responses/error/idx-enroll-new-existing-user-response.json';
import { identifyResponse } from '../../fixtures/okta-responses/success/idx-identify-response';
import idxChallengeResponseEmail from '../../fixtures/okta-responses/success/idx-challenge-response-email.json';
import idxChallengeResponsePassword from '../../fixtures/okta-responses/success/idx-challenge-response-password.json';
import { dangerouslySetPlaceholderPasswordMocks } from './resetPasswordController.4.cy';
import idxChallengeAnswerPasswordEnrollEmailResponse from '../../fixtures/okta-responses/success/idx-challenge-answer-password-enroll-email-response.json';

beforeEach(() => {
	cy.mockPurge();
});

const baseIdxPasscodeRegistrationMocks = () => {
	// interact
	cy.mockNext(idxInteractResponse.code, idxInteractResponse.response);
	// introspect
	cy.mockNext(
		idxIntrospectDefaultResponse.code,
		idxIntrospectDefaultResponse.response,
	);
	// enroll
	cy.mockNext(idxEnrollResponse.code, idxEnrollResponse.response);
};

export const idxPasscodeExistingUserMocks = () => {
	// interact
	cy.mockNext(idxInteractResponse.code, idxInteractResponse.response);
	// introspect
	cy.mockNext(
		idxIntrospectDefaultResponse.code,
		idxIntrospectDefaultResponse.response,
	);
};

const verifyInPasscodeEmailSentPage = () => {
	cy.contains('Enter your one-time code');
	cy.contains('send again');
};

userStatuses.forEach((status) => {
	context(`Given I am a ${status || 'nonexistent'} user`, () => {
		context('When I submit the form on /register', () => {
			beforeEach(() => {
				cy.visit(`/register/email`);
				cy.get('input[name="email"]').type('example@example.com');
			});
			switch (status) {
				case false:
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							baseIdxPasscodeRegistrationMocks();
							cy.mockNext(
								idxEnrollNewSelectAuthenticatorResponse.code,
								idxEnrollNewSelectAuthenticatorResponse.response,
							);
							cy.mockNext(
								idxEnrollNewResponse.code,
								idxEnrollNewResponse.response,
							);
							cy.get('button[type=submit]').click();
							verifyInPasscodeEmailSentPage();
						},
					);
					break;
				case 'ACTIVE':
					specify(
						"Then I should be shown the 'Enter your code' page if I have a validated email (ACTIVE - email + password)",
						() => {
							baseIdxPasscodeRegistrationMocks();
							cy.mockNext(
								idxEnrollNewExistingUserResponse.code,
								idxEnrollNewExistingUserResponse.response,
							);
							// Set the correct user status on the response
							const response = { ...userResponse.response, status };
							const responseWithPassword = {
								...response,
								credentials: {
									...response.credentials,
									password: {},
								},
							};
							cy.mockNext(userResponse.code, responseWithPassword);
							idxPasscodeExistingUserMocks();
							cy.mockNext(200, identifyResponse(true, true));
							cy.mockNext(
								idxChallengeResponseEmail.code,
								idxChallengeResponseEmail.response,
							);
							cy.get('button[type=submit]').click();
							verifyInPasscodeEmailSentPage();
						},
					);
					specify(
						"Then I should be shown the 'Enter your code' page if I have a validated email but no password (ACTIVE - social or passwordless)",
						() => {
							baseIdxPasscodeRegistrationMocks();
							cy.mockNext(
								idxEnrollNewExistingUserResponse.code,
								idxEnrollNewExistingUserResponse.response,
							);
							// Set the correct user status on the response
							const response = { ...userResponse.response, status };
							cy.mockNext(userResponse.code, response);
							idxPasscodeExistingUserMocks();
							cy.mockNext(200, identifyResponse(true, false));
							cy.mockNext(
								idxChallengeResponseEmail.code,
								idxChallengeResponseEmail.response,
							);
							cy.get('button[type=submit]').click();
							verifyInPasscodeEmailSentPage();
						},
					);
					specify(
						"Then I should be shown the 'Check your inbox' page if I don't have a validated email and do have a password set (ACTIVE - password only, email not verified)",
						() => {
							baseIdxPasscodeRegistrationMocks();
							cy.mockNext(
								idxEnrollNewExistingUserResponse.code,
								idxEnrollNewExistingUserResponse.response,
							);
							// Set the correct user status on the response
							const response = { ...userResponse.response, status };
							const responseWithPassword = {
								...response,
								credentials: {
									...response.credentials,
									password: {},
								},
							};
							cy.mockNext(userResponse.code, responseWithPassword);
							idxPasscodeExistingUserMocks();
							cy.mockNext(200, identifyResponse(false, true));
							dangerouslySetPlaceholderPasswordMocks('example@example.com');
							cy.mockNext(
								idxChallengeResponsePassword.code,
								idxChallengeResponsePassword.response,
							);
							cy.mockNext(
								idxChallengeResponsePassword.code,
								idxChallengeResponsePassword.response,
							);
							cy.mockNext(
								idxChallengeAnswerPasswordEnrollEmailResponse.code,
								idxChallengeAnswerPasswordEnrollEmailResponse.response,
							);
							cy.mockNext(
								idxChallengeResponseEmail.code,
								idxChallengeResponseEmail.response,
							);
							cy.get('button[type=submit]').click();
							verifyInPasscodeEmailSentPage();
						},
					);
					//not sure if we need to do anything for the social case here. the only mocked response I can change is the user response
					//but it would be changing fields that no one looks at
					break;
				case 'PROVISIONED':
				case 'STAGED':
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					// Then Gateway should generate an activation token
					specify("Then I should be shown the 'Enter your code' page", () => {
						baseIdxPasscodeRegistrationMocks();
						cy.mockNext(
							idxEnrollNewExistingUserResponse.code,
							idxEnrollNewExistingUserResponse.response,
						);
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, {
							...response,
							status,
						});
						cy.mockNext(200, {});
						dangerouslySetPlaceholderPasswordMocks('test@example.com');
						cy.mockNext(200, { ...userResponse.response, status: 'ACTIVE' });
						idxPasscodeExistingUserMocks();
						cy.mockNext(200, identifyResponse(true, true));
						cy.mockNext(
							idxChallengeResponseEmail.code,
							idxChallengeResponseEmail.response,
						);
						cy.get('button[type=submit]').click();
						verifyInPasscodeEmailSentPage();
					});
					break;
			}
		});
	});
});
