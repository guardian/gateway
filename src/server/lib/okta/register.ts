import crypto from 'crypto';
import {
  RegistrationLocation,
  Status,
  UserResponse,
} from '@/server/models/okta/User';
import {
  createUser,
  getUser,
  activateUser,
  reactivateUser,
  dangerouslyResetPassword,
  getUserGroups,
} from '@/server/lib/okta/api/users';
import { OktaError } from '@/server/models/okta/Error';
import { causesInclude } from '@/server/lib/okta/api/errors';
import { sendAccountExistsEmail } from '@/email/templates/AccountExists/sendAccountExistsEmail';
import { sendResetPasswordEmail } from '@/email/templates/ResetPassword/sendResetPasswordEmail';
import { sendAccountWithoutPasswordExistsEmail } from '@/email/templates/AccountWithoutPasswordExists/sendAccountWithoutPasswordExists';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { sendEmailToUnvalidatedUser } from '@/server/lib/unvalidatedEmail';
import { trackMetric } from '@/server/lib/trackMetric';
import {
  validateRecoveryToken,
  resetPassword as authenticationResetPassword,
} from './api/authentication';

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
 * @returns {Promise<UserResponse>} Promise that resolves to the user object
 */
export const sendRegistrationEmailByUserState = async (
  email: string,
): Promise<UserResponse> => {
  const user = await getUser(email);
  const { id, status } = user;

  switch (status) {
    case Status.STAGED: {
      /* Given I'm a STAGED user
       *    When I try to register/resend
       *    Then Gateway should ask Okta for my activation token
       *    And I should be sent a set password email with the activation
       *    token through Gateway
       *    And my status should become PROVISIONED
       */
      const tokenResponse = await activateUser(user.id, false);
      if (!tokenResponse?.token.length) {
        throw new OktaError({
          message: `Okta user activation failed: missing activation token`,
        });
      }
      const emailIsSent = await sendAccountWithoutPasswordExistsEmail({
        to: user.profile.email,
        activationToken: tokenResponse.token,
      });
      if (!emailIsSent) {
        throw new OktaError({
          message: `Okta user activation failed: Failed to send email`,
        });
      }
      return user;
    }
    case Status.PROVISIONED: {
      /* Given I'm a PROVISIONED user
       *    When I try to register/resend
       *    Then Gateway should ask Okta for my activation token
       *    And I should be sent a set password email with the activation
       *    token through Gateway
       *    And my status should remain PROVISIONED
       */
      const tokenResponse = await reactivateUser(user.id, false);
      if (!tokenResponse?.token.length) {
        throw new OktaError({
          message: `Okta user reactivation failed: missing re-activation token`,
        });
      }
      const emailIsSent = await sendAccountWithoutPasswordExistsEmail({
        to: user.profile.email,
        activationToken: tokenResponse.token,
      });
      if (!emailIsSent) {
        throw new OktaError({
          message: `Okta user reactivation failed: Failed to send email`,
        });
      }
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
       *        Then I should be sent an email with NO reset password token
       *    And my status should remain ACTIVE
       */

      const doesNotHavePassword = !user.credentials.password;

      const groups = await getUserGroups(id);
      // check if the user has their email validated based on group membership
      const emailValidated = groups.some(
        (group) => group.profile.name === 'GuardianUser-EmailValidated',
      );

      if (!emailValidated) {
        if (doesNotHavePassword) {
          // Dangerously reset the password so we _can_ send them an email with a forgot password token
          // generate an recoveryToken OTT and put user into RECOVERY state
          const recoveryToken = await dangerouslyResetPassword(user.id);

          // validate the token
          const { stateToken } = await validateRecoveryToken({
            recoveryToken,
          });

          // check state token is defined
          if (stateToken) {
            // set the placeholder password as a cryptographically secure UUID
            await authenticationResetPassword({
              stateToken,
              newPassword: crypto.randomUUID(),
            });
          } else {
            throw new OktaError({
              message: `Okta user reset password failed: missing state token`,
            });
          }
        }
        // They either now have a placeholder password, or already had a password set,
        // so we can send them an email with a forgot password token
        await sendEmailToUnvalidatedUser(id, user.profile.email);
        trackMetric('OktaUnvalidatedUserResendEmail::Success');
      } else {
        // The user's email is validated - continue with the user status flows.
        // TODO: This could be improved by sending the user a direct reset password token email
        // (generated via users.ts/forgotPassword) if they do have a password, and this same
        // generic email if they don't have a password.
        await sendAccountExistsEmail({
          to: user.profile.email,
        });
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
      const token = await dangerouslyResetPassword(user.id);
      if (!token) {
        throw new OktaError({
          message: `Okta user reset password failed: missing reset password token`,
        });
      }
      const emailIsSent = await sendResetPasswordEmail({
        to: user.profile.email,
        resetPasswordToken: token,
      });
      if (!emailIsSent) {
        throw new OktaError({
          message: `Okta user reset password failed: Failed to send email`,
        });
      }
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
 * @returns {Promise<UserResponse>} Promise that resolves to the user object
 */
export const register = async (
  email: string,
  registrationLocation?: RegistrationLocation,
): Promise<UserResponse> => {
  try {
    return await createUser({
      profile: {
        email,
        login: email,
        isGuardianUser: true,
        registrationPlatform: 'identity-gateway',
        registrationLocation: registrationLocation,
      },
      groupIds: [okta.groupIds.GuardianUserAll],
    });
  } catch (error) {
    if (
      error instanceof OktaError &&
      error.name === 'ApiValidationError' &&
      causesInclude(error.causes, 'already exists')
    ) {
      return sendRegistrationEmailByUserState(email);
    } else {
      throw error;
    }
  }
};
