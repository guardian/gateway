/**
 * Response returned when completing a recovery operation such as resetting a password
 * For more details see Okta's documentation:
 * https://developer.okta.com/docs/reference/api/authn/#recovery-transaction-object
 */

export interface RecoveryTransaction {
  stateToken?: string;
  sessionToken?: string;
  expiresAt: string;
  _embedded: {
    user: {
      id: string;
      profile: {
        login: string;
      };
    };
  };
}
