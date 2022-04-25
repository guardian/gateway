import { Status, UserResponse } from '@/server/models/okta/User';
import {
  createUser,
  getUser,
  activateUser,
  reactivateUser,
  generateResetPasswordToken,
} from '@/server/lib/okta/api/users';
import { OktaError } from '@/server/models/okta/Error';
import { causesInclude } from '@/server/lib/okta/api/errors';
import { sendAccountExistsEmail } from '@/email/templates/AccountExists/sendAccountExistsEmail';
import { sendResetPasswordEmail } from '@/email/templates/ResetPassword/sendResetPasswordEmail';

/**
 * @method register
 *
 * Attempts to create a new user in Okta without credentials and send the activation/welcome email.
 *
 * If a user already exists, we read the state of the user and take a recovery flow action depending on that.
 *
 * @param {string} email
 * @returns {Promise<UserResponse>} Promise that resolves to the user object
 */
export const register = async (email: string): Promise<UserResponse> => {
  try {
    return await createUser({
      profile: {
        email,
        login: email,
        isGuardianUser: true,
        registrationPlatform: 'identity-gateway',
      },
    });
  } catch (error) {
    if (
      error instanceof OktaError &&
      error.name === 'ApiValidationError' &&
      causesInclude(error.causes, 'already exists')
    ) {
      const user = await getUser(email);
      const { status } = user;
      switch (status) {
        case Status.STAGED: {
          /* Given I'm a STAGED user
           *    When I try to register
           *    Then Gateway should ask Okta for my activation token
           *    And I should be sent a set password email with the activation
           *    token through Gateway
           */
          const tokenResponse = await activateUser(user.id, false);
          if (tokenResponse?.token.length) {
            const emailIsSent = await sendAccountExistsEmail({
              to: user.profile.email,
              activationToken: tokenResponse.token,
            });
            if (emailIsSent) {
              return user;
            } else {
              throw new OktaError({
                message: `Okta user activation failed: Failed to send email`,
              });
            }
          } else {
            throw new OktaError({
              message: `Okta user activation failed: missing activation token`,
            });
          }
        }
        case Status.PROVISIONED: {
          /* Given I'm a PROVISIONED user
           *    When I try to register
           *    Then Gateway should ask Okta for my activation token
           *    And I should be sent a set password email with the activation
           *    token through Gateway
           */
          const tokenResponse = await reactivateUser(user.id, false);
          if (tokenResponse?.token.length) {
            const emailIsSent = await sendAccountExistsEmail({
              to: user.profile.email,
              activationToken: tokenResponse.token,
            });
            if (emailIsSent) {
              return user;
            } else {
              throw new OktaError({
                message: `Okta user activation failed: Failed to send email`,
              });
            }
          } else {
            throw new OktaError({
              message: `Okta registration failed: missing re-activation token`,
            });
          }
        }
        case Status.ACTIVE: {
          /* Given I'm an ACTIVE user
           *    When I try to register
           *    Then I should be sent an email with a link to the reset
           *    password form (with no token)
           */
          await sendAccountExistsEmail({
            to: user.profile.email,
          });
          return user;
        }
        case Status.RECOVERY:
        case Status.PASSWORD_EXPIRED: {
          /* Given I'm a RECOVERY or PASSWORD_EXPIRED user
           *    When I try to register
           *    Then Gateway should ask Okta for my reset password token
           *    And I should be sent a reset password email with the activation
           *    token through Gateway
           */
          const tokenResponse = await generateResetPasswordToken(
            user.id,
            false,
          );
          if (tokenResponse?.token.length) {
            const emailIsSent = await sendResetPasswordEmail({
              to: user.profile.email,
              resetPasswordToken: tokenResponse.token,
            });
            if (emailIsSent) {
              return user;
            } else {
              throw new OktaError({
                message: `Okta user activation failed: Failed to send email`,
              });
            }
          }
        }
        default:
          throw new OktaError({
            message: `Okta registration failed with unaccepted Okta user status: ${user.status}`,
          });
      }
    } else {
      throw error;
    }
  }
};

/**
 * @method resendRegistrationEmail
 *
 * Used by the email sent page if we need to resend the registration email.
 *
 * We read the state of the user and send the appropriate email.
 *
 * @param {string} email
 * @returns {Promise<UserResponse>} Promise that resolves to the user object
 */
export const resendRegistrationEmail = async (email: string) => {
  const user: UserResponse = await getUser(email);
  const { status } = user;
  switch (status) {
    case Status.STAGED:
    case Status.PROVISIONED: {
      /* Given I'm a STAGED or PROVISIONED user
       *    When I ask for my email to be resent
       *    Then Gateway should ask Okta for my activation token
       *    And I should be sent a set password email with the activation
       *    token through Gateway
       */
      const tokenResponse = await reactivateUser(user.id, false);
      if (tokenResponse?.token.length) {
        const emailIsSent = await sendAccountExistsEmail({
          to: user.profile.email,
          activationToken: tokenResponse.token,
        });
        if (emailIsSent) {
          return user;
        } else {
          throw new OktaError({
            message: `Okta user activation failed: Failed to send email`,
          });
        }
      } else {
        throw new OktaError({
          message: `Okta registration failed: missing re-activation token`,
        });
      }
    }
    case Status.ACTIVE: {
      /* Given I'm an ACTIVE user
       *    When I ask for my email to be resent
       *    Then I should be sent an email with a link to the reset
       *    password form (with no token)
       */
      await sendAccountExistsEmail({
        to: user.profile.email,
      });
      return user;
    }
    case Status.RECOVERY:
    case Status.PASSWORD_EXPIRED: {
      /* Given I'm a RECOVERY or PASSWORD_EXPIRED user
       *    When I ask for my email to be resent
       *    Then Gateway should ask Okta for my reset password token
       *    And I should be sent a reset password email with the activation
       *    token through Gateway
       */
      const tokenResponse = await generateResetPasswordToken(user.id, false);
      if (tokenResponse?.token.length) {
        const emailIsSent = await sendResetPasswordEmail({
          to: user.profile.email,
          resetPasswordToken: tokenResponse.token,
        });
        if (emailIsSent) {
          return user;
        } else {
          throw new OktaError({
            message: `Okta user activation failed: Failed to send email`,
          });
        }
      }
    }
    default:
      throw new OktaError({
        message: `Okta email resend failed with unaccepted Okta user status: ${user.status}`,
      });
  }
};
