import userStatuses from '../../support/okta/userStatuses';
import userNotFoundError from '../../fixtures/okta-responses/error/user-not-found.json';
import oktaPermissionsError from '../../fixtures/okta-responses/error/no-permission.json';
import userResponse from '../../fixtures/okta-responses/success/user.json';
import socialUserResponse from '../../fixtures/okta-responses/success/social-user.json';
import tokenResponse from '../../fixtures/okta-responses/success/token.json';
import resetPasswordResponse from '../../fixtures/okta-responses/success/reset-password.json';
import verifyRecoveryTokenReponse from '../../fixtures/okta-responses/success/verify-recovery-token.json';
import authResetPasswordResponse from '../../fixtures/okta-responses/success/auth-reset-password.json';
import updateUser from '../../fixtures/okta-responses/success/update-user.json';
import { identifyResponse } from '../../fixtures/okta-responses/success/idx-identify-response';
import idxChallengeResponsePassword from '../../fixtures/okta-responses/success/idx-challenge-response-password.json';
import idxChallengeResponseEmail from '../../fixtures/okta-responses/success/idx-challenge-response-email.json';
import idxRecoverResponse from '../../fixtures/okta-responses/success/idx-recover-response.json';
import idxChallengeAnswerPasswordEnrollEmailResponse from '../../fixtures/okta-responses/success/idx-challenge-answer-password-enroll-email-response.json';
import idxInteractResponse from '../../fixtures/okta-responses/success/idx-interact-response.json';
import idxIntrospectDefaultResponse from '../../fixtures/okta-responses/success/idx-introspect-default-response.json';

export const baseIdxPasscodeResetPasswordMocks = () => {
	// interact
	cy.mockNext(idxInteractResponse.code, idxInteractResponse.response);
	// introspect
	cy.mockNext(
		idxIntrospectDefaultResponse.code,
		idxIntrospectDefaultResponse.response,
	);
};

export const dangerouslySetPlaceholderPasswordMocks = (email: string) => {
	cy.mockNext(200, {
		resetPasswordUrl: `https://${Cypress.env(
			'BASE_URI',
		)}/reset_password/token_token_token_to`,
		activationUrl: `token_token_token_to`,
		activationToken: `token_token_token_to`,
	});
	cy.mockNext(200, {
		stateToken: 'stateToken',
		expiresAt: new Date(Date.now() + 1800000 /* 30min */),
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
	});
	cy.mockNext(200, {
		expiresAt: new Date(Date.now() + 1800000 /* 30min */),
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
	});
	cy.mockNext(updateUser.code, updateUser.response);
};

const verifyIn2MinutesEmailSentPage = () => {
	cy.contains('Check your inbox');
	cy.contains('send again');
	cy.contains('We’ve sent an email');
	cy.contains('within 2 minutes');
};
const verifyInRegularEmailSentPage = () => {
	cy.contains('Check your inbox');
	cy.contains('send again');
	cy.contains('We’ve sent an email');
	cy.contains('within 2 minutes').should('not.exist');
};
const verifyIn2MinutesEmailSentPagePasscodes = () => {
	cy.contains('Enter your one-time code');
	cy.contains('send again');
	cy.contains('We’ve sent a 6-digit code');
	cy.contains('within 2 minutes');
};

const setupMocksForSocialUserPasswordReset = () => {
	// Response from getUser()
	cy.mockNext(socialUserResponse.code, socialUserResponse.response);
	// Response from sendForgotPasswordEmail() - an Okta error
	cy.mockNext(oktaPermissionsError.code, oktaPermissionsError.response);
	// Response from dangerouslyResetPassword() - a reset password URL
	cy.mockNext(resetPasswordResponse.code, resetPasswordResponse.response);
	// Response from validateRecoveryToken() - a state token
	cy.mockNext(
		verifyRecoveryTokenReponse.code,
		verifyRecoveryTokenReponse.response,
	);
	// Response from resetPassword()
	cy.mockNext(
		authResetPasswordResponse.code,
		authResetPasswordResponse.response,
	);
	// set email validated/password set securely flags to false
	cy.mockNext(updateUser.code, updateUser.response);

	// retry sending the email now that the user is "fixed"
	// so we need to mock the same as for the non social user
	cy.mockNext(socialUserResponse.code, socialUserResponse.response);
	// forgotPassword()
	cy.mockNext(200, {
		resetPasswordUrl:
			'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
	});
};

const setupMocksForActiveUsersWithEmailPasswordFactors = (status: string) => {
	// Set the correct user status on the response
	const response = { ...userResponse.response, status };
	cy.mockNext(userResponse.code, response);
	baseIdxPasscodeResetPasswordMocks();
	cy.mockNext(200, identifyResponse(true, true));
	cy.mockNext(
		idxChallengeResponsePassword.code,
		idxChallengeResponsePassword.response,
	);
	cy.mockNext(idxRecoverResponse.code, idxRecoverResponse.response);
	cy.mockNext(
		idxChallengeResponseEmail.code,
		idxChallengeResponseEmail.response,
	);
};

const setupMocksForActiveUsersEmailFactorOnly = (status: string) => {
	// Set the correct user status on the response
	const response = { ...userResponse.response, status };
	cy.mockNext(userResponse.code, response);
	baseIdxPasscodeResetPasswordMocks();
	cy.mockNext(200, identifyResponse(true, false));
	dangerouslySetPlaceholderPasswordMocks('example@example.com');
	// function restart
	baseIdxPasscodeResetPasswordMocks();
	cy.mockNext(200, identifyResponse(true, true));
	cy.mockNext(
		idxChallengeResponsePassword.code,
		idxChallengeResponsePassword.response,
	);
	cy.mockNext(idxRecoverResponse.code, idxRecoverResponse.response);
	cy.mockNext(
		idxChallengeResponseEmail.code,
		idxChallengeResponseEmail.response,
	);
};

const setupMocksForActiveUsersPasswordFactorOnly = (status: string) => {
	// Set the correct user status on the response
	const response = { ...userResponse.response, status };
	cy.mockNext(userResponse.code, response);
	baseIdxPasscodeResetPasswordMocks();
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
};

const setupMocksForNonActiveUsers = (status: string) => {
	// Set the correct user status on the response
	const response = { ...userResponse.response, status };
	cy.mockNext(userResponse.code, response);
	baseIdxPasscodeResetPasswordMocks();
	cy.mockNext(200, {});
	dangerouslySetPlaceholderPasswordMocks('test@example.com');
	cy.mockNext(200, { ...userResponse.response, status: 'ACTIVE' });
	baseIdxPasscodeResetPasswordMocks();
	cy.mockNext(200, identifyResponse(true, true));
	cy.mockNext(
		idxChallengeResponsePassword.code,
		idxChallengeResponsePassword.response,
	);
	cy.mockNext(idxRecoverResponse.code, idxRecoverResponse.response);
	cy.mockNext(
		idxChallengeResponseEmail.code,
		idxChallengeResponseEmail.response,
	);
};

beforeEach(() => {
	cy.mockPurge();
});

userStatuses.forEach((status) => {
	context(
		`Given I am a ${status || 'nonexistent'} user - useOktaClassic`,
		() => {
			context('When I submit the form on /reset-password', () => {
				beforeEach(() => {
					cy.visit(`/reset-password?useOktaClassic=true`);
					cy.get('input[name="email"]').type('example@example.com');
					cy.setEncryptedStateCookie({});
				});
				switch (status) {
					case false:
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								cy.mockNext(userNotFoundError.code, userNotFoundError.response);
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
					case 'ACTIVE':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								// forgotPassword()
								cy.mockNext(200, {
									resetPasswordUrl:
										'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
								});
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						specify(
							"Then I should be shown the 'Check your inbox' page for social user",
							() => {
								setupMocksForSocialUserPasswordReset();
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
					case 'PROVISIONED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(tokenResponse.code, tokenResponse.response);
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
					case 'STAGED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(tokenResponse.code, tokenResponse.response);
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
					case 'RECOVERY':
					case 'PASSWORD_EXPIRED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(
									resetPasswordResponse.code,
									resetPasswordResponse.response,
								);
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
				}
			});
			context('When I submit the form on /reset-password/email-sent', () => {
				beforeEach(() => {
					// We mock the encrypted state cookie here to trick the endpoint
					// into thinking we've just gone through the preceeding flow.
					// For readEncryptedStateCookie to succeed, it relies on a testing
					// env variable to be set, otherwise it won't be able to read the cookie.
					cy.setEncryptedStateCookie({
						email: 'example@example.com',
					});
					cy.visit(`/reset-password/email-sent?useOktaClassic=true`);
				});
				switch (status) {
					case false:
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								cy.mockNext(userNotFoundError.code, userNotFoundError.response);
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
					case 'ACTIVE':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								// forgotPassword()
								cy.mockNext(200, {
									resetPasswordUrl:
										'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
								});
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						specify(
							"Then I should be shown the 'Check your inbox' page for social user",
							() => {
								setupMocksForSocialUserPasswordReset();
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
					case 'PROVISIONED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(tokenResponse.code, tokenResponse.response);
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
					case 'STAGED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(tokenResponse.code, tokenResponse.response);
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
					case 'RECOVERY':
					case 'PASSWORD_EXPIRED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(
									resetPasswordResponse.code,
									resetPasswordResponse.response,
								);
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
				}
			});
			context('When I submit the form on /reset-password/resend', () => {
				beforeEach(() => {
					cy.visit(`/reset-password/resend?useOktaClassic=true`);
					cy.get('input[name="email"]').type('example@example.com');
				});
				switch (status) {
					case false:
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								cy.mockNext(userNotFoundError.code, userNotFoundError.response);
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
					case 'ACTIVE':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								// forgotPassword()
								cy.mockNext(200, {
									resetPasswordUrl:
										'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
								});
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						specify(
							"Then I should be shown the 'Check your inbox' page for social user",
							() => {
								setupMocksForSocialUserPasswordReset();
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
					case 'PROVISIONED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(tokenResponse.code, tokenResponse.response);
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
					case 'STAGED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(tokenResponse.code, tokenResponse.response);
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
					case 'RECOVERY':
					case 'PASSWORD_EXPIRED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(
									resetPasswordResponse.code,
									resetPasswordResponse.response,
								);
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
				}
			});
			context('When I submit the form on /reset-password/expired', () => {
				beforeEach(() => {
					cy.visit(`/reset-password/expired?useOktaClassic=true`);
					cy.get('input[name="email"]').type('example@example.com');
				});
				switch (status) {
					case false:
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								cy.mockNext(userNotFoundError.code, userNotFoundError.response);
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
					case 'ACTIVE':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								// forgotPassword()
								cy.mockNext(200, {
									resetPasswordUrl:
										'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
								});
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						specify(
							"Then I should be shown the 'Check your inbox' page for social user",
							() => {
								setupMocksForSocialUserPasswordReset();
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
					case 'PROVISIONED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(tokenResponse.code, tokenResponse.response);
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
					case 'STAGED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(tokenResponse.code, tokenResponse.response);
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
					case 'RECOVERY':
					case 'PASSWORD_EXPIRED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(
									resetPasswordResponse.code,
									resetPasswordResponse.response,
								);
								cy.get('button[type=submit]').click();
								verifyIn2MinutesEmailSentPage();
							},
						);
						break;
				}
			});
			context('When I submit the form on /set-password/email-sent', () => {
				beforeEach(() => {
					// We mock the encrypted state cookie here to trick the endpoint
					// into thinking we've just gone through the preceeding flow.
					// For readEncryptedStateCookie to succeed, it relies on a testing
					// env variable to be set, otherwise it won't be able to read the cookie.
					cy.setEncryptedStateCookie({
						email: 'example@example.com',
					});
					cy.visit(`/set-password/email-sent?useOktaClassic=true`);
				});
				switch (status) {
					case false:
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								cy.mockNext(userNotFoundError.code, userNotFoundError.response);
								cy.get('button[type=submit]').click();
								verifyInRegularEmailSentPage();
							},
						);
						break;
					case 'ACTIVE':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								// forgotPassword()
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
								setupMocksForSocialUserPasswordReset();
								cy.get('button[type=submit]').click();
								verifyInRegularEmailSentPage();
							},
						);
						break;
					case 'PROVISIONED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(tokenResponse.code, tokenResponse.response);
								cy.get('button[type=submit]').click();
								verifyInRegularEmailSentPage();
							},
						);
						break;
					case 'STAGED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(tokenResponse.code, tokenResponse.response);
								cy.get('button[type=submit]').click();
								verifyInRegularEmailSentPage();
							},
						);
						break;
					case 'RECOVERY':
					case 'PASSWORD_EXPIRED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(
									resetPasswordResponse.code,
									resetPasswordResponse.response,
								);
								cy.get('button[type=submit]').click();
								verifyInRegularEmailSentPage();
							},
						);
						break;
				}
			});
			context('When I submit the form on /set-password/resend', () => {
				beforeEach(() => {
					cy.visit(`/set-password/resend?useOktaClassic=true`);
					cy.get('input[name="email"]').type('example@example.com');
				});
				switch (status) {
					case false:
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								cy.mockNext(userNotFoundError.code, userNotFoundError.response);
								cy.get('button[type=submit]').click();
								verifyInRegularEmailSentPage();
							},
						);
						break;
					case 'ACTIVE':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								// forgotPassword()
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
								setupMocksForSocialUserPasswordReset();
								cy.get('button[type=submit]').click();
								verifyInRegularEmailSentPage();
							},
						);
						break;
					case 'PROVISIONED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(tokenResponse.code, tokenResponse.response);
								cy.get('button[type=submit]').click();
								verifyInRegularEmailSentPage();
							},
						);
						break;
					case 'STAGED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(tokenResponse.code, tokenResponse.response);
								cy.get('button[type=submit]').click();
								verifyInRegularEmailSentPage();
							},
						);
						break;
					case 'RECOVERY':
					case 'PASSWORD_EXPIRED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(
									resetPasswordResponse.code,
									resetPasswordResponse.response,
								);
								cy.get('button[type=submit]').click();
								verifyInRegularEmailSentPage();
							},
						);
						break;
				}
			});
			context('When I submit the form on /set-password/expired', () => {
				beforeEach(() => {
					cy.visit(`/set-password/expired?useOktaClassic=true`);
					cy.get('input[name="email"]').type('example@example.com');
				});
				switch (status) {
					case false:
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								cy.mockNext(userNotFoundError.code, userNotFoundError.response);
								cy.get('button[type=submit]').click();
								verifyInRegularEmailSentPage();
							},
						);
						break;
					case 'ACTIVE':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								// forgotPassword()
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
								setupMocksForSocialUserPasswordReset();
								cy.get('button[type=submit]').click();
								verifyInRegularEmailSentPage();
							},
						);
						break;
					case 'PROVISIONED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(tokenResponse.code, tokenResponse.response);
								cy.get('button[type=submit]').click();
								verifyInRegularEmailSentPage();
							},
						);
						break;
					case 'STAGED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(tokenResponse.code, tokenResponse.response);
								cy.get('button[type=submit]').click();
								verifyInRegularEmailSentPage();
							},
						);
						break;
					case 'RECOVERY':
					case 'PASSWORD_EXPIRED':
						specify(
							"Then I should be shown the 'Check your inbox' page",
							() => {
								// Set the correct user status on the response
								const response = { ...userResponse.response, status };
								cy.mockNext(userResponse.code, response);
								cy.mockNext(
									resetPasswordResponse.code,
									resetPasswordResponse.response,
								);
								cy.get('button[type=submit]').click();
								verifyInRegularEmailSentPage();
							},
						);
						break;
				}
			});
		},
	);

	context(`Given I am a ${status || 'nonexistent'} user - passcodes`, () => {
		context('When I submit the form on /reset-password', () => {
			beforeEach(() => {
				cy.visit(`/reset-password`);
				cy.get('input[name="email"]').type('example@example.com');
				cy.setEncryptedStateCookie({});
			});
			switch (status) {
				case false:
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							cy.mockNext(userNotFoundError.code, userNotFoundError.response);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'ACTIVE':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForActiveUsersWithEmailPasswordFactors(status);
							cy.get('button[type="submit"]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					specify(
						"Then I should be shown the 'Enter your one-time code' page for social user",
						() => {
							setupMocksForActiveUsersEmailFactorOnly(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					specify(
						"Then I should be shown the 'Enter your one-time code' page for password only authenticator user",
						() => {
							setupMocksForActiveUsersPasswordFactorOnly(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'PROVISIONED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'STAGED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
			}
		});
		context('When I submit the form on /reset-password/email-sent', () => {
			beforeEach(() => {
				cy.setEncryptedStateCookie({
					stateHandle: 'test-state-handle',
					stateHandleExpiresAt: new Date(
						Date.now() + 1000 * 60 * 30,
					).toISOString(),
					email: 'test@example.com',
				});
				cy.setCookie('cypress-mock-state', '0'); // passcode send again timer
				cy.visit(`/reset-password/email-sent`);
			});
			switch (status) {
				case false:
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							cy.mockNext(userNotFoundError.code, userNotFoundError.response);
							cy.contains('send again').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'ACTIVE':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForActiveUsersWithEmailPasswordFactors(status);
							cy.contains('send again').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					specify(
						"Then I should be shown the 'Enter your one-time code' page for social user",
						() => {
							setupMocksForActiveUsersEmailFactorOnly(status);
							cy.contains('send again').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					specify(
						"Then I should be shown the 'Enter your one-time code' page for password only authenticator user",
						() => {
							setupMocksForActiveUsersPasswordFactorOnly(status);
							cy.contains('send again').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'PROVISIONED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.contains('send again').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'STAGED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.contains('send again').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.contains('send again').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
			}
		});
		context('When I submit the form on /reset-password/resend', () => {
			beforeEach(() => {
				cy.visit(`/reset-password/resend`);
				cy.get('input[name="email"]').type('example@example.com');
				cy.setEncryptedStateCookie({});
			});
			switch (status) {
				case false:
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							cy.mockNext(userNotFoundError.code, userNotFoundError.response);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'ACTIVE':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForActiveUsersWithEmailPasswordFactors(status);
							cy.get('button[type="submit"]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					specify(
						"Then I should be shown the 'Enter your one-time code' page for social user",
						() => {
							setupMocksForActiveUsersEmailFactorOnly(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					specify(
						"Then I should be shown the 'Enter your one-time code' page for password only authenticator user",
						() => {
							setupMocksForActiveUsersPasswordFactorOnly(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'PROVISIONED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'STAGED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
			}
		});
		context('When I submit the form on /reset-password/expired', () => {
			beforeEach(() => {
				cy.visit(`/reset-password/expired`);
				cy.get('input[name="email"]').type('example@example.com');
				cy.setEncryptedStateCookie({});
			});
			switch (status) {
				case false:
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							cy.mockNext(userNotFoundError.code, userNotFoundError.response);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'ACTIVE':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForActiveUsersWithEmailPasswordFactors(status);
							cy.get('button[type="submit"]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					specify(
						"Then I should be shown the 'Enter your one-time code' page for social user",
						() => {
							setupMocksForActiveUsersEmailFactorOnly(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					specify(
						"Then I should be shown the 'Enter your one-time code' page for password only authenticator user",
						() => {
							setupMocksForActiveUsersPasswordFactorOnly(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'PROVISIONED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'STAGED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
			}
		});
		context('When I submit the form on /set-password/resend', () => {
			beforeEach(() => {
				cy.visit(`/set-password/reend`);
				cy.get('input[name="email"]').type('example@example.com');
				cy.setEncryptedStateCookie({});
			});
			switch (status) {
				case false:
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							cy.mockNext(userNotFoundError.code, userNotFoundError.response);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'ACTIVE':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForActiveUsersWithEmailPasswordFactors(status);
							cy.get('button[type="submit"]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					specify(
						"Then I should be shown the 'Enter your one-time code' page for social user",
						() => {
							setupMocksForActiveUsersEmailFactorOnly(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					specify(
						"Then I should be shown the 'Enter your one-time code' page for password only authenticator user",
						() => {
							setupMocksForActiveUsersPasswordFactorOnly(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'PROVISIONED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'STAGED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
			}
		});
		context('When I submit the form on /set-password/expired', () => {
			beforeEach(() => {
				cy.visit(`/set-password/expired`);
				cy.get('input[name="email"]').type('example@example.com');
				cy.setEncryptedStateCookie({});
			});
			switch (status) {
				case false:
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							cy.mockNext(userNotFoundError.code, userNotFoundError.response);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'ACTIVE':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForActiveUsersWithEmailPasswordFactors(status);
							cy.get('button[type="submit"]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					specify(
						"Then I should be shown the 'Enter your one-time code' page for social user",
						() => {
							setupMocksForActiveUsersEmailFactorOnly(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					specify(
						"Then I should be shown the 'Enter your one-time code' page for password only authenticator user",
						() => {
							setupMocksForActiveUsersPasswordFactorOnly(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'PROVISIONED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'STAGED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					specify(
						"Then I should be shown the 'Enter your one-time code' page",
						() => {
							setupMocksForNonActiveUsers(status);
							cy.get('button[type=submit]').click();
							verifyIn2MinutesEmailSentPagePasscodes();
						},
					);
					break;
			}
		});
	});

	context(`generic error handling - ${status}`, () => {
		it('shows a generic error when something goes wrong', () => {
			cy.visit('/reset-password');
			cy.get('input[name="email"]').type('test@example.com');
			const response = { ...userResponse.response, status };
			cy.mockNext(userResponse.code, response);
			cy.mockNext(403, {
				errorCode: 'E0000006',
				errorSummary:
					'You do not have permission to perform the requested action',
				errorLink: 'E0000006',
				errorId: 'errorId',
				errorCauses: [],
			});
			cy.get('button[type="submit"]').click();
			cy.contains('Sorry, something went wrong. Please try again.');
		});
	});
});
