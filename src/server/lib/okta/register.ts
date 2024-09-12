import { Status, UserResponse } from '@/server/models/okta/User';
import {
	createUser,
	getUser,
	activateUser,
	reactivateUser,
	dangerouslyResetPassword,
	getUserGroups,
	forgotPassword,
	deactivateUser,
} from '@/server/lib/okta/api/users';
import { OktaError } from '@/server/models/okta/Error';
import { causesInclude } from '@/server/lib/okta/api/errors';
import { sendAccountExistsEmail } from '@/email/templates/AccountExists/sendAccountExistsEmail';
import { sendResetPasswordEmail } from '@/email/templates/ResetPassword/sendResetPasswordEmail';
import { sendAccountWithoutPasswordExistsEmail } from '@/email/templates/AccountWithoutPasswordExists/sendAccountWithoutPasswordExists';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { sendEmailToUnvalidatedUser } from '@/server/lib/unvalidatedEmail';
import { trackMetric } from '@/server/lib/trackMetric';
import { logger } from '@/server/lib/serverSideLogger';
import dangerouslySetPlaceholderPassword from './dangerouslySetPlaceholderPassword';
import { sendCompleteRegistration } from '@/email/templates/CompleteRegistration/sendCompleteRegistration';
import { encryptOktaRecoveryToken } from '@/server/lib/deeplink/oktaRecoveryToken';
import { encryptRegistrationConsents } from '@/server/lib/registrationConsents';
import { RegistrationConsents } from '@/shared/model/RegistrationConsents';
import { RegistrationLocation } from '@/shared/model/RegistrationLocation';
import { TrackingQueryParams } from '@/shared/model/QueryParams';
import { emailSendMetric } from '@/server/models/Metrics';
import { getRegistrationPlatform } from '@/server/lib/registrationPlatform';

const { okta } = getConfiguration();

/**
 * @name sendRegistrationEmailByUserState
 *
 * Used by the register page and the email sent page to share code between the two.
 *
 * In case of the register page, user creation is attempted, if that fails, and the user
 * exists, we use this method to send the correct email to the user based on state
 *
 * The email sent page uses this method directly to send the email to the user based on the user
 * state.
 *
 * We read the state of the user by email and send the appropriate email based on the user status.
 *
 * @param email
 * @param appClientId - optional, used to determine if the user is coming from a native app
 * @returns {Promise<UserResponse>} Promise that resolves to the user object
 */
const sendRegistrationEmailByUserState = async ({
	email,
	appClientId,
	ref,
	refViewId,
	loopDetectionFlag = false,
	ip,
}: {
	email: string;
	appClientId?: string;
	loopDetectionFlag?: boolean;
	ip?: string;
} & TrackingQueryParams): Promise<UserResponse> => {
	const user = await getUser(email, ip);
	const { id, status } = user;

	switch (status) {
		case Status.STAGED:
		case Status.DEPROVISIONED:
			try {
				/* Given I'm a STAGED or DEPROVISIONED user
				 *    When I try to register/resend
				 *    Then Gateway should ask Okta for my activation token
				 *    And I should be sent a set password email with the activation
				 *    token through Gateway
				 *    And my status should become PROVISIONED
				 */
				const tokenResponse = await activateUser({
					id: user.id,
					ip,
				});
				if (!tokenResponse?.token.length) {
					throw new OktaError({
						message: `Okta user activation failed: missing activation token`,
					});
				}
				const emailIsSent = await sendAccountWithoutPasswordExistsEmail({
					to: user.profile.email,
					activationToken: await encryptOktaRecoveryToken({
						token: tokenResponse.token,
						appClientId,
					}),
					ref,
					refViewId,
				});
				if (!emailIsSent) {
					trackMetric(
						emailSendMetric('OktaAccountExistsWithoutPassword', 'Failure'),
					);
					throw new OktaError({
						message: `Okta user activation failed: Failed to send email`,
					});
				}
			} catch (error) {
				// these users are in a special state where they used a passcode to create their account
				// but failed to complete the flow by setting a password, leaving them in an unusual state
				// where they're in the STAGED state but cannot recover normally
				// to remediate these users we have to deactivate them
				// and then reactivate them in order to send them a create password email
				if (error instanceof OktaError && error.code === 'E0000038') {
					// if a loop is detected, then throw early to prevent infinite loop
					if (loopDetectionFlag) {
						throw error;
					}

					trackMetric(
						'PasscodePasswordNotCompleteRemediation-Register-STAGED-Start',
					);

					// 1. deactivate the user
					try {
						await deactivateUser({
							id: user.id,
							ip,
						});
						trackMetric('OktaDeactivateUser::Success');
					} catch (error) {
						trackMetric('OktaDeactivateUser::Failure');
						logger.error(
							'Okta user deactivation failed',
							error instanceof OktaError ? error.message : error,
						);
						throw error;
					}

					trackMetric(
						'PasscodePasswordNotCompleteRemediation-Register-STAGED-Complete',
					);

					// rerun the sendRegistrationEmailByUserState function to catch the user in the DEPROVISIONED state
					return sendRegistrationEmailByUserState({
						email,
						appClientId,
						ref,
						refViewId,
						loopDetectionFlag: true,
						ip,
					});
				}

				logger.error(
					'Okta user activation failed',
					error instanceof OktaError ? error.message : error,
				);

				// otherwise throw the error to the outer catch block
				// as it's not handled in the if statement above
				throw error;
			}

			trackMetric(
				emailSendMetric('OktaAccountExistsWithoutPassword', 'Success'),
			);
			return user;
		case Status.PROVISIONED: {
			try {
				/* Given I'm a PROVISIONED user
				 *    When I try to register/resend
				 *    Then Gateway should ask Okta for my activation token
				 *    And I should be sent a set password email with the activation
				 *    token through Gateway
				 *    And my status should remain PROVISIONED
				 */
				const tokenResponse = await reactivateUser({
					id: user.id,
					ip,
				});
				if (!tokenResponse?.token.length) {
					throw new OktaError({
						message: `Okta user reactivation failed: missing re-activation token`,
					});
				}
				const emailIsSent = await sendAccountWithoutPasswordExistsEmail({
					to: user.profile.email,
					activationToken: await encryptOktaRecoveryToken({
						token: tokenResponse.token,
						appClientId,
					}),
					ref,
					refViewId,
				});
				if (!emailIsSent) {
					trackMetric(
						emailSendMetric('OktaAccountExistsWithoutPassword', 'Failure'),
					);
					throw new OktaError({
						message: `Okta user reactivation failed: Failed to send email`,
					});
				}
			} catch (error) {
				// these users are in a special state where they used a passcode to create their account
				// but failed to complete the flow by setting a password, leaving them in an unusual state
				// where they're in the PROVISIONED state but cannot recover normally
				// to remediate these users we have to deactivate them
				// and then reactivate them in order to send them a create password email
				if (error instanceof OktaError && error.code === 'E0000038') {
					// if a loop is detected, then throw early to prevent infinite loop
					if (loopDetectionFlag) {
						throw error;
					}

					trackMetric(
						'PasscodePasswordNotCompleteRemediation-Register-PROVISIONED-Start',
					);

					// 1. deactivate the user
					try {
						await deactivateUser({
							id: user.id,
							ip,
						});
						trackMetric('OktaDeactivateUser::Success');
					} catch (error) {
						trackMetric('OktaDeactivateUser::Failure');
						logger.error(
							'Okta user deactivation failed',
							error instanceof OktaError ? error.message : error,
						);
						throw error;
					}

					trackMetric(
						'PasscodePasswordNotCompleteRemediation-Register-PROVISIONED-Complete',
					);

					// rerun the sendRegistrationEmailByUserState function to catch the user in the DEPROVISIONED state
					return sendRegistrationEmailByUserState({
						email,
						appClientId,
						ref,
						refViewId,
						loopDetectionFlag: true,
						ip,
					});
				}

				logger.error(
					'Okta user reactivation failed',
					error instanceof OktaError ? error.message : error,
				);

				// otherwise throw the error to the outer catch block
				// as it's not handled in the if statement above
				throw error;
			}
			trackMetric(
				emailSendMetric('OktaAccountExistsWithoutPassword', 'Success'),
			);
			return user;
		}
		case Status.ACTIVE: {
			/* Given I'm an ACTIVE user
			 *    When I try to register
			 *    Given I don't have a validated email
			 *        Given I have a password set
			 *            Then I should be sent an email with a reset password token
			 *        Given I do NOT have a password set
			 *            Then I should have my password dangerously reset, and then
			 *            sent an email with a reset password token
			 *    Given I have a validated email
			 *        Given I have a password set
			 *            Then I should be sent an email with a reset password token
			 *        Given I do NOT have a password set (how did I get here??)
			 *            Then I should have my password dangerously reset, and then
			 *            sent an email with a reset password token
			 *    And my status should remain ACTIVE
			 */

			const doesNotHavePassword = !user.credentials.password;

			const groups = await getUserGroups(id, ip);
			// check if the user has their email validated based on group membership
			const emailValidated = groups.some(
				(group) => group.profile.name === 'GuardianUser-EmailValidated',
			);

			if (doesNotHavePassword) {
				// The user does not have a password set, so we set a placeholder
				// password first, then proceed with the rest of the operation.
				await dangerouslySetPlaceholderPassword({
					id: user.id,
					ip,
				});
			}
			// Now the user has a password set, so we can get a reset password token
			// and send them an email which contains it, allowing them to immediately
			// set their password.
			if (!emailValidated) {
				// The user has a password set, but their email is not validated,
				// so we send an unvalidated email address email. This function
				// generates the forgot password token too.
				await sendEmailToUnvalidatedUser({
					id,
					email: user.profile.email,
					appClientId,
					ref,
					refViewId,
					ip,
				});
			} else {
				// The user has a validated email and a password set, so we can send
				// them an email with a reset password token. This ensures that their
				// account does not get locked into a non-ACTIVE state (if they remember
				// their password, they will still be able to log in and can disregard
				// the token in the email).
				try {
					const activationToken = await forgotPassword(id, ip);
					await sendAccountExistsEmail({
						to: user.profile.email,
						activationToken: await encryptOktaRecoveryToken({
							token: activationToken,
							appClientId,
						}),
						ref,
						refViewId,
					});
					trackMetric(emailSendMetric('OktaAccountExists', 'Success'));
				} catch (error) {
					// If the forgot password operation failed for whatever reason, we catch and
					// log it but continue by sending the user a generic email.
					if (error instanceof OktaError) {
						logger.error(
							'Okta forgot password token retrieval error',
							error.message,
						);
					} else {
						logger.error('Okta forgot password token retrieval error', error);
					}
					await sendAccountExistsEmail({
						to: user.profile.email,
						ref,
						refViewId,
					});
					trackMetric(emailSendMetric('OktaAccountExists', 'Success'));
				}
			}
			return user;
		}
		case Status.RECOVERY:
		case Status.PASSWORD_EXPIRED: {
			/* Given I'm a RECOVERY or PASSWORD_EXPIRED user
			 *    When I try to register
			 *    Then Gateway should ask Okta for my reset password token
			 *    And I should be sent a reset password email with the activation
			 *    token through Gateway
			 *    And my status should become RECOVERY
			 */
			const token = await dangerouslyResetPassword(user.id, ip);
			if (!token) {
				throw new OktaError({
					message: `Okta user reset password failed: missing reset password token`,
				});
			}
			const emailIsSent = await sendResetPasswordEmail({
				to: user.profile.email,
				resetPasswordToken: await encryptOktaRecoveryToken({
					token,
					appClientId,
				}),
				ref,
				refViewId,
			});
			if (!emailIsSent) {
				trackMetric(emailSendMetric('OktaResetPassword', 'Failure'));
				throw new OktaError({
					message: `Okta user reset password failed: Failed to send email`,
				});
			}
			trackMetric(emailSendMetric('OktaResetPassword', 'Success'));
			return user;
		}
		default:
			throw new OktaError({
				message: `Okta registration/resend failed with unaccepted Okta user status: ${user.status}`,
			});
	}
};

/**
 * @method register
 *
 * Attempts to create a new user in Okta without credentials and send the activation/welcome email.
 *
 * If a user already exists, we read the state of the user and take a recovery flow action depending on that.
 *
 * @param {string} email
 * @param {RegistrationLocation} registrationLocation
 * @param {RegistrationConsents} consents - list of consents set during registration
 * @returns {Promise<UserResponse>} Promise that resolves to the user object
 */
export const register = async ({
	email,
	registrationLocation,
	appClientId,
	consents,
	ref,
	refViewId,
	ip,
}: {
	email: string;
	registrationLocation?: RegistrationLocation;
	appClientId?: string;
	consents?: RegistrationConsents;
	ip?: string;
} & TrackingQueryParams): Promise<UserResponse> => {
	try {
		// Create the user in Okta, but do not send the activation email
		// because we send the email ourselves through Gateway.
		const userResponse = await createUser(
			{
				profile: {
					email,
					login: email,
					isGuardianUser: true,
					registrationPlatform: await getRegistrationPlatform(appClientId),
					registrationLocation: registrationLocation,
				},
				groupIds: [okta.groupIds.GuardianUserAll],
			},
			ip,
		);
		if (!userResponse) {
			throw new OktaError({
				message: `Okta user creation failed: missing user response`,
			});
		}
		const {
			id,
			profile: { email: emailAddress },
		} = userResponse;

		// Encrypt any consents we need to send in the activation email
		const encryptedConsents = consents && encryptRegistrationConsents(consents);

		// Generate an activation token for the new user...
		const tokenResponse = await activateUser({
			id,
			ip,
		});
		if (!tokenResponse?.token.length) {
			throw new OktaError({
				message: `Okta user creation failed: missing activation token`,
			});
		}
		// ...and send the activation email.
		const emailIsSent = await sendCompleteRegistration({
			to: emailAddress,
			activationToken: await encryptOktaRecoveryToken({
				token: tokenResponse.token,
				encryptedRegistrationConsents: encryptedConsents,
				appClientId,
			}),
			ref,
			refViewId,
		});
		if (!emailIsSent) {
			trackMetric(emailSendMetric('OktaCompleteRegistration', 'Failure'));
			throw new OktaError({
				message: `Okta user creation failed: failed to send email`,
			});
		}
		trackMetric(emailSendMetric('OktaCompleteRegistration', 'Success'));
		return userResponse;
	} catch (error) {
		if (
			error instanceof OktaError &&
			error.name === 'ApiValidationError' &&
			causesInclude(error.causes, 'already exists')
		) {
			return sendRegistrationEmailByUserState({
				email,
				appClientId,
				ip,
			});
		} else {
			throw error;
		}
	}
};
