import { updateUser } from '@/server/lib/okta/api/users';
import { UserResponse } from '@/server/models/okta/User';

/**
 * @method validateEmailAndPasswordSetSecurely
 *
 * Used to update the user has verified/validated their email and set a password securely.
 *
 * @param {string} id accepts the Okta user ID, email address (login) or login shortname (as long as it is unambiguous)
 * @returns {Promise<UserResponse>} Promise that resolves to the user object
 */
export const validateEmailAndPasswordSetSecurely = async (
  id: string,
): Promise<UserResponse> => {
  const timestamp = new Date().toISOString();
  return await updateUser(
    { id },
    {
      profile: {
        emailValidated: true,
        lastEmailValidatedTimestamp: timestamp,
        passwordSetSecurely: true,
        lastPasswordSetSecurelyTimestamp: timestamp,
      },
    },
  );
};
