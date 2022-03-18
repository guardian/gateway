import { Status, UserResponse } from '@/server/models/okta/User';
import {
  createUser,
  getUser,
  activateUser,
  reactivateUser,
} from '@/server/lib/okta/api/users';
import { OktaError } from '@/server/models/okta/Error';
import { causesInclude } from '@/server/lib/okta/api/errors';

/**
 * @method register
 *
 * Attempts to create a new user in Okta without credentials and send the activation/welcome email.
 *
 * If a user already exists, we read the state of the user and take a recovery flow action depending on that.
 *
 * TODO: Implement recovery for Status.ACTIVE || Status.RECOVERY || Status.PASSWORD_EXPIRED
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
      const user = await getUser({ id: email });
      const { status } = user;
      switch (status) {
        case Status.STAGED: {
          await activateUser({ id: user.id });
          return user;
        }
        case Status.PROVISIONED: {
          await reactivateUser({ id: user.id });
          return user;
        }
        case Status.ACTIVE || Status.RECOVERY || Status.PASSWORD_EXPIRED: {
          // TODO: implement reset password email; this throws an error for now so registration fails
          throw new OktaError({
            message: `Okta registration failed with unaccepted Okta user status: ${user.status}`,
          });
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
 * TODO: Implement recovery for Status.ACTIVE || Status.RECOVERY || Status.PASSWORD_EXPIRED
 *
 * @param {string} email
 * @returns {Promise<UserResponse>} Promise that resolves to the user object
 */
export const resendRegistrationEmail = async (email: string) => {
  const user: UserResponse = await getUser({ id: email });
  const { status } = user;
  switch (status) {
    case Status.STAGED: {
      await activateUser({ id: email });
      break;
    }
    case Status.PROVISIONED: {
      await reactivateUser({ id: email });
      break;
    }
    // TODO: implement reset password email & emails for other user STATUSES
    default:
      throw new OktaError({
        message: `Okta registration failed with unaccepted Okta user status: ${user.status}`,
      });
  }
};
