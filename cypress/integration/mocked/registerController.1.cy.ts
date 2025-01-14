import userStatuses from '../../support/okta/userStatuses';
import userResponse from '../../fixtures/okta-responses/success/user.json';
import userGroupsResponse from '../../fixtures/okta-responses/success/valid-user-groups.json';
import socialUserResponse from '../../fixtures/okta-responses/success/social-user.json';
import userExistsError from '../../fixtures/okta-responses/error/user-exists.json';
import successTokenResponse from '../../fixtures/okta-responses/success/token.json';
import resetPasswordResponse from '../../fixtures/okta-responses/success/reset-password.json';
import idxInteractResponse from '../../fixtures/okta-responses/success/idx-interact-response.json';
import idxIntrospectDefaultResponse from '../../fixtures/okta-responses/success/idx-introspect-default-response.json';
import idxEnrollResponse from '../../fixtures/okta-responses/success/idx-enroll-response.json';
import idxEnrollNewResponse from '../../fixtures/okta-responses/success/idx-enroll-new-response.json';
import idxEnrollNewSelectAuthenticatorResponse from '../../fixtures/okta-responses/success/idx-enroll-new-response-select-authenticator.json';
import idxEnrollNewExistingUserResponse from '../../fixtures/okta-responses/error/idx-enroll-new-existing-user-response.json';
import updateUser from '../../fixtures/okta-responses/success/update-user.json';

beforeEach(() => {
	cy.mockPurge();
});

const verifyInRegularEmailSentPage = () => {
	cy.contains('Check your inbox');
	cy.contains('send again');
};

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

const verifyInPasscodeEmailSentPage = () => {
	cy.contains('Enter your code');
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
					specify("Then I should be shown the 'Check your inbox' page", () => {
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
					});
					break;
				case 'ACTIVE':
					specify(
						"Then I should be shown the 'Check your inbox' page if I have a validated email",
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
							cy.mockNext(userExistsError.code, userExistsError.response);
							cy.mockNext(userResponse.code, responseWithPassword);
							cy.mockNext(userGroupsResponse.code, userGroupsResponse.response);
							cy.get('button[type=submit]').click();
							verifyInRegularEmailSentPage();
						},
					);
					specify(
						"Then I should be shown the 'Check your inbox' page if I have a validated email but no password",
						() => {
							baseIdxPasscodeRegistrationMocks();
							cy.mockNext(
								idxEnrollNewExistingUserResponse.code,
								idxEnrollNewExistingUserResponse.response,
							);
							// Set the correct user status on the response
							const response = { ...userResponse.response, status };
							cy.mockNext(userExistsError.code, userExistsError.response);
							cy.mockNext(userResponse.code, response);
							cy.mockNext(userGroupsResponse.code, userGroupsResponse.response);
							// dangerouslyResetPassword()
							cy.mockNext(200, {
								resetPasswordUrl:
									'https://example.com/reset_password/XE6wE17zmphl3KqAPFxO',
							});
							// validateRecoveryToken()
							cy.mockNext(200, {
								stateToken: 'sometoken',
							});
							// authenticationResetPassword()
							cy.mockNext(200, {});
							// set email validated/password set securely flags to false
							cy.mockNext(updateUser.code, updateUser.response);
							// from sendEmailToUnvalidatedUser() --> forgotPassword()
							cy.mockNext(200, {
								resetPasswordUrl:
									'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
							});
							cy.get('button[type=submit]').click();
							verifyInRegularEmailSentPage();
						},
					);
					specify(
						"Then I should be shown the 'Check your inbox' page for social user",
						() => {
							baseIdxPasscodeRegistrationMocks();
							cy.mockNext(
								idxEnrollNewExistingUserResponse.code,
								idxEnrollNewExistingUserResponse.response,
							);
							cy.mockNext(userExistsError.code, userExistsError.response);
							cy.mockNext(socialUserResponse.code, socialUserResponse.response);
							cy.mockNext(userGroupsResponse.code, userGroupsResponse.response);
							// dangerouslyResetPassword()
							cy.mockNext(200, {
								resetPasswordUrl:
									'https://example.com/reset_password/XE6wE17zmphl3KqAPFxO',
							});
							// validateRecoveryToken()
							cy.mockNext(200, {
								stateToken: 'sometoken',
							});
							// authenticationResetPassword()
							cy.mockNext(200, {});
							// set email validated/password set securely flags to false
							cy.mockNext(updateUser.code, updateUser.response);
							// from sendEmailToUnvalidatedUser() --> forgotPassword()
							cy.mockNext(200, {
								resetPasswordUrl:
									'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
							});
							cy.get('button[type=submit]').click();
							verifyInRegularEmailSentPage();
						},
					);
					specify(
						"Then I should be shown the 'Check your inbox' page if I don't have a validated email and don't have a password set",
						() => {
							baseIdxPasscodeRegistrationMocks();
							cy.mockNext(
								idxEnrollNewExistingUserResponse.code,
								idxEnrollNewExistingUserResponse.response,
							);
							// Set the correct user status on the response
							const response = { ...userResponse.response, status };
							cy.mockNext(userExistsError.code, userExistsError.response);
							// This user response doesn't have a password credential
							cy.mockNext(userResponse.code, response);
							const userGroupsResponseWithoutEmailValidated =
								userGroupsResponse.response.filter(
									(group) =>
										group.profile.name !== 'GuardianUser-EmailValidated',
								);
							cy.mockNext(
								userGroupsResponse.code,
								userGroupsResponseWithoutEmailValidated,
							);
							// dangerouslyResetPassword()
							cy.mockNext(200, {
								resetPasswordUrl:
									'https://example.com/reset_password/XE6wE17zmphl3KqAPFxO',
							});
							// validateRecoveryToken()
							cy.mockNext(200, {
								stateToken: 'sometoken',
							});
							// authenticationResetPassword()
							cy.mockNext(200, {});
							// set email validated/password set securely flags to false
							cy.mockNext(updateUser.code, updateUser.response);
							// from sendEmailToUnvalidatedUser() --> forgotPassword()
							cy.mockNext(200, {
								resetPasswordUrl:
									'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
							});
							cy.get('button[type=submit]').click();
							verifyInRegularEmailSentPage();
						},
					);
					specify(
						"Then I should be shown the 'Check your inbox' page if I don't have a validated email and do have a password set",
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
							cy.mockNext(userExistsError.code, userExistsError.response);
							cy.mockNext(userResponse.code, responseWithPassword);
							cy.mockNext(userGroupsResponse.code, userGroupsResponse.response);
							cy.get('button[type=submit]').click();
							verifyInRegularEmailSentPage();
						},
					);
					//not sure if we need to do anything for the social case here. the only mocked response I can change is the user response
					//but it would be changing fields that no one looks at
					break;
				case 'PROVISIONED':
				case 'STAGED':
					// Then Gateway should generate an activation token
					specify("Then I should be shown the 'Check your inbox' page", () => {
						baseIdxPasscodeRegistrationMocks();
						cy.mockNext(
							idxEnrollNewExistingUserResponse.code,
							idxEnrollNewExistingUserResponse.response,
						);
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userExistsError.code, userExistsError.response);
						cy.mockNext(userResponse.code, response);
						cy.mockNext(
							successTokenResponse.code,
							successTokenResponse.response,
						);
						cy.get('button[type=submit]').click();
						verifyInRegularEmailSentPage();
					});
					break;
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					// Then Gateway should generate a reset password token
					specify("Then I should be shown the 'Check your inbox' page", () => {
						baseIdxPasscodeRegistrationMocks();
						cy.mockNext(
							idxEnrollNewExistingUserResponse.code,
							idxEnrollNewExistingUserResponse.response,
						);
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userExistsError.code, userExistsError.response);
						cy.mockNext(userResponse.code, response);
						cy.mockNext(
							resetPasswordResponse.code,
							resetPasswordResponse.response,
						);
						cy.get('button[type=submit]').click();
						verifyInRegularEmailSentPage();
					});
					break;
			}
		});
	});
});
