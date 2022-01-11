import { User } from '@/server/models/okta/User';

export interface Token {
  stateToken?: string;
  sessionToken?: string;
  expiresAt: string;
  _embedded?: {
    user: User;
  };
}
