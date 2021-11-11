import { CreateUserRequestOptions } from '@okta/okta-sdk-nodejs/src/types/models/CreateUserRequest';
import { oktaClient } from '@/server/lib/okta/client';
import { sendOktaActivationEmail } from '@/server/lib/idapi/user';

export const register = (
  email: string,
  ip: string,
  returnUrl?: string,
  refViewId?: string,
  ref?: string,
  activate = false,
  sendEmail = false,
): Promise<void> => {
  const client = oktaClient();
  const user: CreateUserRequestOptions = {
    profile: {
      email,
      login: email,
    },
  };
  return client
    .createUser(user, { activate })
    .then((user) => client.activateUser(user.id, { sendEmail }))
    .then((activationToken) =>
      sendOktaActivationEmail(
        email,
        activationToken.activationToken,
        ip,
        refViewId,
        ref,
      ),
    );
};
