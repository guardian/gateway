/**
 * Test Scenarios:
 *
 * Description                                      | Outcome
 * -------------------------------------------------|-------------------------------------------------------------------
 * State token has expired                          | show session expired page
 * State token invalid, recovery token invalid      | show link expired page
 * State token invalid, recovery token valid        | show reset password page with global error: There was a problem changing your password, please try again.
 * State token absent, recovery token invalid       | show link expired page
 * State token absent, recovery token valid         | show reset password page with global error: There was a problem changing your password, please try again.
 * Unexpected error checking the token              | show link expired page
 * Unexpected error changing the password           | show password page with global error: There was a problem changing your password, please try again.
 * Password is too short                            | show password page with field error: Please make sure your password is at least 8 characters long.
 * Password is too long                             | show password page with field error: Please make sure your password is not longer than 72 characters.
 * Password cannot be your current password         | show reset password page with field error: Please use a password that is different to your current password.
 * Password cannot be a common or breached password | show reset password page with field error: Please use a password that is hard to guess.
 * Password set successfully                        | show password updated confirmation page
 */

import { randomPassword } from '../../support/commands/testUser';

describe('Change password in Okta', () => {
	context('reset password page', () => {
		const email = 'mrtest@theguardian.com';

		beforeEach(() => {
			cy.mockPurge();
		});

		const mockValidateRecoveryTokenSuccess = (
			date: Date = new Date(Date.now() + 1800000 /* 30min */),
		) => {
			cy.mockNext(200, {
				stateToken: 'stateToken',
				expiresAt: date.toISOString(),
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
		};

		const mockValidateRecoveryTokenFailure = () => {
			cy.mockNext(403, {
				errorCode: 'E0000105',
				errorSummary:
					'You have accessed an account recovery link that has expired or been previously used.',
				errorLink: 'E0000105',
				errorId: 'errorId',
				errorCauses: [],
			});
		};

		const mockPasswordResetSuccess = (
			date: Date = new Date(Date.now() + 1800000 /* 30min */),
		) => {
			cy.mockNext(200, {
				expiresAt: date.toISOString(),
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
		};

		const mockUpdateUserSuccess = () => {
			cy.mockNext(200, {
				id: '12345',
				status: 'SUCCESS',
				profile: {
					login: email,
					email,
					isGuardianUser: true,
				},
				credentials: {},
			});
		};

		const mockPasswordResetFailure = (cause: string) => {
			cy.mockNext(403, {
				errorCode: 'E0000080',
				errorSummary:
					'The password does not meet the complexity requirements of the current password policy.',
				errorLink: 'E0000080',
				errorId: 'errorId',
				errorCauses: [
					{
						errorSummary: cause,
					},
				],
			});
		};

		const mockPasswordResetInvalidStateTokenFailure = () => {
			cy.mockNext(403, {
				errorCode: 'E0000011',
				errorSummary: 'Invalid token provided',
				errorLink: 'E0000011',
				errorId: 'errorId',
				errorCauses: [],
			});
		};

		const interceptBreachPasswordCheck = () => {
			cy.intercept({
				method: 'GET',
				url: 'https://api.pwnedpasswords.com/range/*',
			}).as('breachCheck');
		};

		it('shows the link expired page if the state token and the recovery token are invalid', () => {
			interceptBreachPasswordCheck();

			mockValidateRecoveryTokenSuccess(); // needs to succeed once for the page to display
			mockPasswordResetInvalidStateTokenFailure();
			mockValidateRecoveryTokenFailure();

			cy.visit('/reset-password/token');

			cy.get('input[name="password"]').type(randomPassword());
			cy.get('button[type="submit"]').click();

			cy.contains('Link expired');
		});

		it('shows the password reset page with errors if the state token is invalid but the recovery token is still valid', () => {
			interceptBreachPasswordCheck();

			mockValidateRecoveryTokenSuccess();
			mockValidateRecoveryTokenSuccess();
			mockPasswordResetInvalidStateTokenFailure();
			mockValidateRecoveryTokenSuccess();

			cy.visit('/reset-password/token');

			cy.get('input[name="password"]').type(randomPassword());
			cy.get('button[type="submit"]').click();

			cy.contains('Create new password');
			cy.contains(`You’ve requested to create a new password for ${email}`);
			cy.contains(
				'There was a problem changing your password, please try again.',
			);
		});

		it('shows the link expired page if recovery token is invalid after submitting password', () => {
			interceptBreachPasswordCheck();

			mockValidateRecoveryTokenSuccess();
			mockValidateRecoveryTokenFailure();

			cy.visit('/reset-password/token');
			cy.clearCookie('GU_GATEWAY_STATE');

			cy.get('input[name="password"]').type(randomPassword());
			cy.get('button[type="submit"]').click();

			cy.contains('Link expired');
		});

		it('shows the link expired page if an unexpected error occurred when validating the recovery token', () => {
			cy.mockNext(500);
			cy.visit('/reset-password/token');
			cy.contains('Link expired');
		});

		it('shows the reset password page with errors if an unexpected error occurred when resetting the password', () => {
			interceptBreachPasswordCheck();

			mockValidateRecoveryTokenSuccess();
			cy.mockNext(503);
			mockValidateRecoveryTokenSuccess();

			cy.visit('/reset-password/token');

			cy.get('input[name="password"]').type(randomPassword());
			cy.get('button[type="submit"]').click();

			cy.contains('Create new password');
			cy.contains(`You’ve requested to create a new password for ${email}`);
			cy.contains(
				'There was a problem changing your password, please try again.',
			);
		});

		it('shows the reset password page with field error if the password is too short', () => {
			interceptBreachPasswordCheck();

			mockValidateRecoveryTokenSuccess();
			mockPasswordResetFailure(
				'Password requirements were not met. Password requirements: at least 6 characters.',
			);
			mockValidateRecoveryTokenSuccess();

			cy.visit('/reset-password/token');

			// even though this test is for a short password, we enter a valid password here to bypass
			// client-side password complexity checks in order to test the server-side response
			cy.get('input[name="password"]').type(randomPassword());
			cy.get('button[type="submit"]').click();

			cy.contains('Create new password');
			cy.contains(
				'Please make sure your password is at least 8 characters long.',
			);
		});

		it('shows the reset password page with field error if the password is too long', () => {
			interceptBreachPasswordCheck();

			mockValidateRecoveryTokenSuccess();
			mockPasswordResetFailure(
				'Password requirements were not met. Password requirements: maximum 72 characters.',
			);
			mockValidateRecoveryTokenSuccess();

			cy.visit('/reset-password/token');

			cy.get('input[name="password"]').type(randomPassword());
			cy.get('button[type="submit"]').click();

			cy.contains('Create new password');
			cy.contains(
				'Please make sure your password is not longer than 72 characters.',
			);
		});

		it('shows the reset password page with field error if the password is the same as the current password', () => {
			interceptBreachPasswordCheck();

			mockValidateRecoveryTokenSuccess();
			mockPasswordResetFailure('Password cannot be your current password');
			mockValidateRecoveryTokenSuccess();

			cy.visit('/reset-password/token');

			cy.get('input[name="password"]').type(randomPassword());
			cy.get('button[type="submit"]').click();

			cy.contains('Create new password');
			cy.contains(
				'Please use a password that is different to your current password.',
			);
		});

		it('shows the reset password page with field error if the password is a common or breached password', () => {
			interceptBreachPasswordCheck();

			mockValidateRecoveryTokenSuccess();
			mockPasswordResetFailure(
				'This password was found in a list of commonly used passwords. Please try another password.',
			);
			mockValidateRecoveryTokenSuccess();

			cy.visit('/reset-password/token');

			cy.get('input[name="password"]').type(randomPassword());
			cy.get('button[type="submit"]').click();

			cy.contains('Create new password');
			cy.contains('Please use a password that is hard to guess.');
		});

		it('shows the password updated page on successful update', () => {
			interceptBreachPasswordCheck();

			mockValidateRecoveryTokenSuccess();
			mockValidateRecoveryTokenSuccess();
			mockPasswordResetSuccess();
			mockUpdateUserSuccess();

			cy.intercept(
				`http://localhost:9000/oauth2/${Cypress.env(
					'OKTA_CUSTOM_OAUTH_SERVER',
				)}/v1/authorize*`,
				(req) => {
					req.redirect(
						`https://${Cypress.env('BASE_URI')}/reset-password/complete`,
					);
				},
			).as('authRedirect');

			cy.visit('/reset-password/token');

			cy.get('input[name="password"]').type('thisisalongandunbreachedpassword');
			cy.wait('@breachCheck');
			cy.get('button[type="submit"]').click();
			cy.wait('@authRedirect').then(() => {
				cy.contains('Password updated');
				cy.contains(email);
				cy.contains('Continue to the Guardian').should(
					'have.attr',
					'href',
					`${Cypress.env('DEFAULT_RETURN_URI')}`,
				);
			});
		});
	});
});
