import userStatuses from '../../support/okta/userStatuses';
import userExistsError from '../../fixtures/okta-responses/error/user-exists.json';
import userResponse from '../../fixtures/okta-responses/success/user.json';
import userGroupsResponse from '../../fixtures/okta-responses/success/valid-user-groups.json';
import socialUserResponse from '../../fixtures/okta-responses/success/social-user.json';
import successTokenResponse from '../../fixtures/okta-responses/success/token.json';
import resetPasswordResponse from '../../fixtures/okta-responses/success/reset-password.json';
import idxInteractResponse from '../../fixtures/okta-responses/success/idx-interact-response.json';
import idxIntrospectDefaultResponse from '../../fixtures/okta-responses/success/idx-introspect-default-response.json';
import idxEnrollResponse from '../../fixtures/okta-responses/success/idx-enroll-response.json';
import idxEnrollNewResponse from '../../fixtures/okta-responses/success/idx-enroll-new-response.json';
import idxEnrollNewSelectAuthenticatorResponse from '../../fixtures/okta-responses/success/idx-enroll-new-response-select-authenticator.json';
import idxEnrollNewExistingUserResponse from '../../fixtures/okta-responses/error/idx-enroll-new-existing-user-response.json';
import { identifyResponse } from '../../fixtures/okta-responses/success/idx-identify-response';
import { idxPasscodeExistingUserMocks } from './registerController.1.cy';
import idxChallengeResponseEmail from '../../fixtures/okta-responses/success/idx-challenge-response-email.json';
import { dangerouslySetPlaceholderPasswordMocks } from './resetPasswordController.4.cy';

beforeEach(() => {
	cy.mockPurge();
});
const verifyInRegularEmailSentPage = () => {
	cy.contains('Check your inbox');
	cy.contains('send again');
	cy.contains('within 2 minutes').should('not.exist');
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
		context('When I submit the form on /register/email-sent', () => {
			beforeEach(() => {
				// We mock the encrypted state cookie here to trick the endpoint
				// into thinking we've just gone through the preceeding flow.
				// For readEncryptedStateCookie to succeed, it relies on a testing
				// env variable to be set, otherwise it won't be able to read the cookie.
				cy.setEncryptedStateCookie({
					email: 'example@example.com',
				});
				cy.visit(`/register/email-sent`);
			});
			switch (status) {
				case false:
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status: 'STAGED' };
						cy.mockNext(userResponse.code, response);
						cy.get('[data-cy="main-form-submit-button"]').click();
						verifyInRegularEmailSentPage();
					});
					break;
				case 'ACTIVE':
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userExistsError.code, userExistsError.response);
						cy.mockNext(userResponse.code, response);
						cy.mockNext(userGroupsResponse.code, userGroupsResponse.response);
						cy.get('[data-cy="main-form-submit-button"]').click();
						verifyInRegularEmailSentPage();
					});
					specify(
						"Then I should be shown the 'Check your inbox' page for social users ",
						() => {
							cy.mockNext(userExistsError.code, userExistsError.response);
							cy.mockNext(socialUserResponse.code, socialUserResponse.response);
							cy.mockNext(userGroupsResponse.code, userGroupsResponse.response);
							cy.get('[data-cy="main-form-submit-button"]').click();
							verifyInRegularEmailSentPage();
						},
					);
					specify(
						"Then I should be shown the 'Check your inbox' page if I don't have a validated email and don't have a password set",
						() => {
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
							// from sendEmailToUnvalidatedUser() --> forgotPassword()
							cy.mockNext(200, {
								resetPasswordUrl:
									'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
							});
							cy.get('[data-cy="main-form-submit-button"]').click();
							verifyInRegularEmailSentPage();
						},
					);
					specify(
						"Then I should be shown the 'Check your inbox' page if I don't have a validated email and do have a password set",
						() => {
							// Set the correct user status on the response
							const response = { ...userResponse.response, status };
							cy.mockNext(userExistsError.code, userExistsError.response);
							cy.mockNext(userResponse.code, response);
							cy.mockNext(userGroupsResponse.code, userGroupsResponse.response);
							cy.get('[data-cy="main-form-submit-button"]').click();
							verifyInRegularEmailSentPage();
						},
					);
					//i Think this is the same as register.. I don't know if I should add the modked social user here
					// when the execution doesn't check the credentials part of the response
					break;
				case 'PROVISIONED':
				case 'STAGED':
					// Then Gateway should generate an activation token
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userExistsError.code, userExistsError.response);
						cy.mockNext(userResponse.code, response);
						cy.mockNext(
							successTokenResponse.code,
							successTokenResponse.response,
						);
						cy.get('[data-cy="main-form-submit-button"]').click();
						verifyInRegularEmailSentPage();
					});
					break;
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					// Then Gateway should generate a reset password token
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userExistsError.code, userExistsError.response);
						cy.mockNext(userResponse.code, response);
						cy.mockNext(
							resetPasswordResponse.code,
							resetPasswordResponse.response,
						);
						cy.get('[data-cy="main-form-submit-button"]').click();
						verifyInRegularEmailSentPage();
					});
					break;
			}
		});
		context('When I submit the form on /welcome/email-sent', () => {
			beforeEach(() => {
				// We mock the encrypted state cookie here to trick the endpoint
				// into thinking we've just gone through the preceeding flow.
				// For readEncryptedStateCookie to succeed, it relies on a testing
				// env variable to be set, otherwise it won't be able to read the cookie.
				cy.setEncryptedStateCookie({
					email: 'example@example.com',
				});
				cy.visit(`/welcome/email-sent`);
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
						cy.get('[data-cy="main-form-submit-button"]').click();
						verifyInPasscodeEmailSentPage();
					});
					break;
				case 'ACTIVE':
					specify("Then I should be shown the 'Check your inbox' page", () => {
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
						cy.get('[data-cy="main-form-submit-button"]').click();
						verifyInRegularEmailSentPage();
					});
					specify(
						"Then I should be shown the 'Check your inbox' page for social user",
						() => {
							baseIdxPasscodeRegistrationMocks();
							cy.mockNext(
								idxEnrollNewExistingUserResponse.code,
								idxEnrollNewExistingUserResponse.response,
							);
							cy.mockNext(userExistsError.code, userExistsError.response);
							// This user response doesn't have a password, which is what we want
							// for a social user.
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
							// from sendEmailToUnvalidatedUser() --> forgotPassword()
							cy.mockNext(200, {
								resetPasswordUrl:
									'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
							});
							cy.get('[data-cy="main-form-submit-button"]').click();
							verifyInRegularEmailSentPage();
						},
					);
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
						cy.get('[data-cy="main-form-submit-button"]').click();
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
						cy.get('[data-cy="main-form-submit-button"]').click();
						verifyInRegularEmailSentPage();
					});
					break;
			}
		});
		context('When I submit the form on /welcome/resend', () => {
			beforeEach(() => {
				cy.visit(`/welcome/resend`);
				cy.get('input[name="email"]').type('example@example.com');
			});
			switch (status) {
				case false:
					specify("Then I should be shown the 'Enter your code' page", () => {
						baseIdxPasscodeRegistrationMocks();
						cy.mockNext(
							idxEnrollNewSelectAuthenticatorResponse.code,
							idxEnrollNewSelectAuthenticatorResponse.response,
						);
						cy.mockNext(
							idxEnrollNewResponse.code,
							idxEnrollNewResponse.response,
						);
						cy.get('[data-cy="main-form-submit-button"]').click();
						verifyInPasscodeEmailSentPage();
					});
					break;
				case 'ACTIVE':
					specify("Then I should be shown the 'Enter your code' page", () => {
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

						cy.get('[data-cy="main-form-submit-button"]').click();
						verifyInPasscodeEmailSentPage();
					});
					break;
				case 'PROVISIONED':
				case 'STAGED':
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					// Then Gateway should generate an activation token
					specify("Then I should be shown the 'Check your inbox' page", () => {
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
						cy.get('[data-cy="main-form-submit-button"]').click();
						verifyInPasscodeEmailSentPage();
					});
					break;
			}
		});
		context('When I submit the form on /welcome/expired', () => {
			beforeEach(() => {
				cy.visit(`/welcome/expired`);
				cy.get('input[name="email"]').type('example@example.com');
			});
			switch (status) {
				case false:
					specify("Then I should be shown the 'Enter your code' page", () => {
						baseIdxPasscodeRegistrationMocks();
						cy.mockNext(
							idxEnrollNewSelectAuthenticatorResponse.code,
							idxEnrollNewSelectAuthenticatorResponse.response,
						);
						cy.mockNext(
							idxEnrollNewResponse.code,
							idxEnrollNewResponse.response,
						);
						cy.get('[data-cy="main-form-submit-button"]').click();
						verifyInPasscodeEmailSentPage();
					});
					break;
				case 'ACTIVE':
					specify("Then I should be shown the 'Enter your code' page", () => {
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

						cy.get('[data-cy="main-form-submit-button"]').click();
						verifyInPasscodeEmailSentPage();
					});
					break;
				case 'PROVISIONED':
				case 'STAGED':
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					// Then Gateway should generate an activation token
					specify("Then I should be shown the 'Check your inbox' page", () => {
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
						cy.get('[data-cy="main-form-submit-button"]').click();
						verifyInPasscodeEmailSentPage();
					});
					break;
			}
		});
	});
});
