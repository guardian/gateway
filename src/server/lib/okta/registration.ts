import { CreateUserRequestOptions } from '@okta/okta-sdk-nodejs/src/types/models/CreateUserRequest';
import { oktaClient } from '@/server/lib/okta/client';
import { UserActivationToken } from '@okta/okta-sdk-nodejs';

export const register = (email: string): Promise<UserActivationToken> => {
  const activate = false;
  const sendEmail = true;
  const client = oktaClient();
  const user: CreateUserRequestOptions = {
    profile: {
      email,
      login: email,
    },
  };
  return client
    .createUser(user, { activate })
    .then((user) => client.activateUser(user.id, { sendEmail }));
};
