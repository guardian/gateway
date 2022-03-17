import { updateUser } from '@/server/lib/okta/api/users';
import { UserResponse } from '@/server/models/okta/User';

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
