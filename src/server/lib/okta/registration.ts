import { CreateUserRequestOptions } from '@okta/okta-sdk-nodejs/src/types/models/CreateUserRequest';
import { oktaClient } from '@/server/lib/okta/client';
import { User } from '@okta/okta-sdk-nodejs';

export const registerWithOkta = (email: string): Promise<User> => {
  const client = oktaClient();
  const user: CreateUserRequestOptions = {
    profile: {
      email,
      login: email,
    },
  };
  return client.createUser(user, { activate: true });
};
