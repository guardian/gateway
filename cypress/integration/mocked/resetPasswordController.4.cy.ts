import userStatuses from '../../support/okta/userStatuses';
import userNotFoundError from '../../fixtures/okta-responses/error/user-not-found.json';
import oktaPermissionsError from '../../fixtures/okta-responses/error/no-permission.json';
import userResponse from '../../fixtures/okta-responses/success/user.json';
import socialUserResponse from '../../fixtures/okta-responses/success/social-user.json';
import tokenResponse from '../../fixtures/okta-responses/success/token.json';
import resetPasswordResponse from '../../fixtures/okta-responses/success/reset-password.json';
import verifyRecoveryTokenReponse from '../../fixtures/okta-responses/success/verify-recovery-token.json';
import authResetPasswordResponse from '../../fixtures/okta-responses/success/auth-reset-password.json';
beforeEach(() => {
	cy.mockPurge();
});

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

	// retry sending the email now that the user is "fixed"
	// so we need to mock the same as for the non social user
	cy.mockNext(socialUserResponse.code, socialUserResponse.response);
	// forgotPassword()
	cy.mockNext(200, {
		resetPasswordUrl:
			'https://example.com/signin/reset-password/XE6wE17zmphl3KqAPFxO',
	});
};

userStatuses.forEach((status) => {
	context(`Given I am a ${status || 'nonexistent'} user`, () => {
		context('When I submit the form on /reset-password', () => {
			beforeEach(() => {
				cy.visit(`/reset-password`);
				cy.get('input[name="email"]').type('example@example.com');
			});
			switch (status) {
				case false:
					specify("Then I should be shown the 'Check your inbox' page", () => {
						cy.mockNext(userNotFoundError.code, userNotFoundError.response);
						cy.get('button[type=submit]').click();
						verifyIn2MinutesEmailSentPage();
					});
					break;
				case 'ACTIVE':
					specify("Then I should be shown the 'Check your inbox' page", () => {
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
					});
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
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(tokenResponse.code, tokenResponse.response);
						cy.get('button[type=submit]').click();
						verifyIn2MinutesEmailSentPage();
					});
					break;
				case 'STAGED':
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(tokenResponse.code, tokenResponse.response);
						cy.get('button[type=submit]').click();
						verifyIn2MinutesEmailSentPage();
					});
					break;
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(
							resetPasswordResponse.code,
							resetPasswordResponse.response,
						);
						cy.get('button[type=submit]').click();
						verifyIn2MinutesEmailSentPage();
					});
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
					status: String(status),
				});
				cy.visit(`/reset-password/email-sent`);
			});
			switch (status) {
				case false:
					specify("Then I should be shown the 'Check your inbox' page", () => {
						cy.mockNext(userNotFoundError.code, userNotFoundError.response);
						cy.get('button[type=submit]').click();
						verifyIn2MinutesEmailSentPage();
					});
					break;
				case 'ACTIVE':
					specify("Then I should be shown the 'Check your inbox' page", () => {
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
					});
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
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(tokenResponse.code, tokenResponse.response);
						cy.get('button[type=submit]').click();
						verifyIn2MinutesEmailSentPage();
					});
					break;
				case 'STAGED':
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(tokenResponse.code, tokenResponse.response);
						cy.get('button[type=submit]').click();
						verifyIn2MinutesEmailSentPage();
					});
					break;
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(
							resetPasswordResponse.code,
							resetPasswordResponse.response,
						);
						cy.get('button[type=submit]').click();
						verifyIn2MinutesEmailSentPage();
					});
					break;
			}
		});
		context('When I submit the form on /reset-password/resend', () => {
			beforeEach(() => {
				cy.visit(`/reset-password/resend`);
				cy.get('input[name="email"]').type('example@example.com');
			});
			switch (status) {
				case false:
					specify("Then I should be shown the 'Check your inbox' page", () => {
						cy.mockNext(userNotFoundError.code, userNotFoundError.response);
						cy.get('button[type=submit]').click();
						verifyIn2MinutesEmailSentPage();
					});
					break;
				case 'ACTIVE':
					specify("Then I should be shown the 'Check your inbox' page", () => {
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
					});
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
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(tokenResponse.code, tokenResponse.response);
						cy.get('button[type=submit]').click();
						verifyIn2MinutesEmailSentPage();
					});
					break;
				case 'STAGED':
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(tokenResponse.code, tokenResponse.response);
						cy.get('button[type=submit]').click();
						verifyIn2MinutesEmailSentPage();
					});
					break;
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(
							resetPasswordResponse.code,
							resetPasswordResponse.response,
						);
						cy.get('button[type=submit]').click();
						verifyIn2MinutesEmailSentPage();
					});
					break;
			}
		});
		context('When I submit the form on /reset-password/expired', () => {
			beforeEach(() => {
				cy.visit(`/reset-password/expired`);
				cy.get('input[name="email"]').type('example@example.com');
			});
			switch (status) {
				case false:
					specify("Then I should be shown the 'Check your inbox' page", () => {
						cy.mockNext(userNotFoundError.code, userNotFoundError.response);
						cy.get('button[type=submit]').click();
						verifyIn2MinutesEmailSentPage();
					});
					break;
				case 'ACTIVE':
					specify("Then I should be shown the 'Check your inbox' page", () => {
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
					});
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
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(tokenResponse.code, tokenResponse.response);
						cy.get('button[type=submit]').click();
						verifyIn2MinutesEmailSentPage();
					});
					break;
				case 'STAGED':
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(tokenResponse.code, tokenResponse.response);
						cy.get('button[type=submit]').click();
						verifyIn2MinutesEmailSentPage();
					});
					break;
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(
							resetPasswordResponse.code,
							resetPasswordResponse.response,
						);
						cy.get('button[type=submit]').click();
						verifyIn2MinutesEmailSentPage();
					});
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
					status: String(status),
				});
				cy.visit(`/set-password/email-sent`);
			});
			switch (status) {
				case false:
					specify("Then I should be shown the 'Check your inbox' page", () => {
						cy.mockNext(userNotFoundError.code, userNotFoundError.response);
						cy.get('button[type=submit]').click();
						verifyInRegularEmailSentPage();
					});
					break;
				case 'ACTIVE':
					specify("Then I should be shown the 'Check your inbox' page", () => {
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
					});
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
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(tokenResponse.code, tokenResponse.response);
						cy.get('button[type=submit]').click();
						verifyInRegularEmailSentPage();
					});
					break;
				case 'STAGED':
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(tokenResponse.code, tokenResponse.response);
						cy.get('button[type=submit]').click();
						verifyInRegularEmailSentPage();
					});
					break;
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
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
		context('When I submit the form on /set-password/resend', () => {
			beforeEach(() => {
				cy.visit(`/set-password/resend`);
				cy.get('input[name="email"]').type('example@example.com');
			});
			switch (status) {
				case false:
					specify("Then I should be shown the 'Check your inbox' page", () => {
						cy.mockNext(userNotFoundError.code, userNotFoundError.response);
						cy.get('button[type=submit]').click();
						verifyInRegularEmailSentPage();
					});
					break;
				case 'ACTIVE':
					specify("Then I should be shown the 'Check your inbox' page", () => {
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
					});
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
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(tokenResponse.code, tokenResponse.response);
						cy.get('button[type=submit]').click();
						verifyInRegularEmailSentPage();
					});
					break;
				case 'STAGED':
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(tokenResponse.code, tokenResponse.response);
						cy.get('button[type=submit]').click();
						verifyInRegularEmailSentPage();
					});
					break;
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
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

		context('When I submit the form on /set-password/expired', () => {
			beforeEach(() => {
				cy.visit(`/set-password/expired`);
				cy.get('input[name="email"]').type('example@example.com');
			});
			switch (status) {
				case false:
					specify("Then I should be shown the 'Check your inbox' page", () => {
						cy.mockNext(userNotFoundError.code, userNotFoundError.response);
						cy.get('button[type=submit]').click();
						verifyInRegularEmailSentPage();
					});
					break;
				case 'ACTIVE':
					specify("Then I should be shown the 'Check your inbox' page", () => {
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
					});
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
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(tokenResponse.code, tokenResponse.response);
						cy.get('button[type=submit]').click();
						verifyInRegularEmailSentPage();
					});
					break;
				case 'STAGED':
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
						cy.mockNext(userResponse.code, response);
						cy.mockNext(tokenResponse.code, tokenResponse.response);
						cy.get('button[type=submit]').click();
						verifyInRegularEmailSentPage();
					});
					break;
				case 'RECOVERY':
				case 'PASSWORD_EXPIRED':
					specify("Then I should be shown the 'Check your inbox' page", () => {
						// Set the correct user status on the response
						const response = { ...userResponse.response, status };
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
