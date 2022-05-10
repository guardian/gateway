import { HalLink } from 'hal-types';

/**
 * Okta's Authentication API models, see - https://developer.okta.com/docs/reference/api/authn/
 */

// https://developer.okta.com/docs/reference/api/authn/#transaction-state
enum AuthenticationTransactionState {
  LOCKED_OUT = 'LOCKED_OUT',
  MFA_CHALLENGE = 'MFA_CHALLENGE',
  MFA_ENROLL_ACTIVATE = 'MFA_ENROLL_ACTIVATE',
  MFA_ENROLL = 'MFA_ENROLL',
  MFA_REQUIRED = 'MFA_REQUIRED',
  PASSWORD_EXPIRED = 'PASSWORD_EXPIRED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PASSWORD_WARN = 'PASSWORD_WARN',
  RECOVERY_CHALLENGE = 'RECOVERY_CHALLENGE',
  RECOVERY = 'RECOVERY',
  SUCCESS = 'SUCCESS',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
}

// https://developer.okta.com/docs/reference/api/authn/#factor-result
enum AuthenticationFactorResult {
  CANCELLED = 'CANCELLED',
  ERROR = 'ERROR',
  PASSCODE_REPLAYED = 'PASSCODE_REPLAYED',
  TIMEOUT = 'TIMEOUT',
  TIME_WINDOW_EXCEEDED = 'TIME_WINDOW_EXCEEDED',
  WAITING = 'WAITING',
}

// https://developer.okta.com/docs/reference/api/authn/#links-object
interface AuthenticationLinks {
  next?: HalLink;
  prev?: HalLink;
  cancel?: HalLink;
  skip?: HalLink;
  resend?: HalLink;
}

// https://developer.okta.com/docs/reference/api/authn/#user-object
interface AuthenticationEmbeddedUser {
  id: string;
  passwordChanged?: string;
  profile: AuthenticationEmbeddedUserProfile;
  recovery_question?: AuthenticationEmbeddedRecoveryQuestion;
}

// https://developer.okta.com/docs/reference/api/authn/#user-profile-object
interface AuthenticationEmbeddedUserProfile {
  firstName: string;
  secondName: string;
  locale?: string;
  login: string;
  timeZone?: string;
}

// https://developer.okta.com/docs/reference/api/authn/#recovery-question-object
interface AuthenticationEmbeddedRecoveryQuestion {
  question: string;
}

// https://developer.okta.com/docs/reference/api/authn/#authentication-transaction-object
export interface AuthenticationTransaction {
  _embedded?: {
    user: AuthenticationEmbeddedUser;
  };
  _links?: AuthenticationLinks;
  expiresAt?: string;
  factorResult?: AuthenticationFactorResult;
  sessionToken?: string;
  stateToken?: string;
  status?: AuthenticationTransactionState;
}

// https://developer.okta.com/docs/reference/api/authn/#request-parameters-for-primary-authentication
export interface AuthenticationRequestParameters {
  audience?: string;
  context?: {
    deviceToken?: string;
  };
  options?: {
    multiOptionalFactorEnroll?: boolean;
    warnBeforePasswordExpired?: boolean;
  };
  password?: string;
  token?: string;
  username?: string;
}
