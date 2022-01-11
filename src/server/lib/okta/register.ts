import { Status, User } from '@/server/models/okta/User';
import {
  createUser,
  fetchUser,
  activateUser,
  reactivateUser,
} from '@/server/lib/okta/api/users';
import {
  OktaError,
  ResourceAlreadyExistsError,
} from '@/server/models/okta/Error';

export const register = async (email: string): Promise<User> => {
  try {
    return await createUser(email);
  } catch (error) {
    if (error instanceof ResourceAlreadyExistsError) {
      const user: User = await fetchUser({ id: email });
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
          throw new OktaError(
            `Okta registration failed with unaccepted Okta user status: ${user.status}`,
          );
        }
        default:
          throw new OktaError(
            `Okta registration failed with unaccepted Okta user status: ${user.status}`,
          );
      }
    } else {
      throw error;
    }
  }
};

export const resendRegistrationEmail = async (email: string) => {
  const user: User = await fetchUser({ id: email });
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
      throw new OktaError(
        `Okta registration resend email failed with Okta user status: ${status}`,
      );
  }
};
