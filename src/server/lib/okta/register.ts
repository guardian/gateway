import { Status, UserResponse } from '@/server/models/okta/User';
import {
  createUser,
  fetchUser,
  activateUser,
  reactivateUser,
} from '@/server/lib/okta/api/users';
import { OktaError } from '@/server/models/okta/Error';
import { causesInclude } from '@/server/lib/okta/api/errors';

export const register = async (email: string): Promise<UserResponse> => {
  try {
    return await createUser({
      profile: {
        email: email,
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
      const user = await fetchUser({ id: email });
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

export const resendRegistrationEmail = async (email: string) => {
  const user: UserResponse = await fetchUser({ id: email });
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
