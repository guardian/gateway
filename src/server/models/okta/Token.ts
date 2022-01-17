import { User } from '@/server/models/okta/User';

/**
 * An example of a token response object can be found here:
 * https://developer.okta.com/docs/reference/api/authn/#response-example-for-primary-authentication-with-public-application-success
 */

export interface Token {
  stateToken?: string;
  sessionToken?: string;
  expiresAt: string;
  _embedded?: {
    user: User;
  };
}
