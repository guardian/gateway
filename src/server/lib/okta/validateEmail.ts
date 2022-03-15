import { updateUser } from '@/server/lib/okta/api/users';
import { UserResponse } from '@/server/models/okta/User';

export const validateEmailAndPasswordSetSecurely = async (
  id: string,
): Promise<UserResponse> =>
  await updateUser(
    { id: id },
    {
      profile: {
        emailValidated: true,
        lastEmailValidatedTimestamp: new Date(),
        passwordSetSecurely: true,
        lastPasswordSetSecurelyTimestamp: new Date(),
      },
    },
  );
