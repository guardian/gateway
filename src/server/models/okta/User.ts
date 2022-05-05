// social registration identity provider type
type RegistrationIdp = 'google' | 'apple' | 'facebook';

// https://developer.okta.com/docs/reference/api/users/#profile-object
interface UserProfile {
  email: string;
  login: string;
  isGuardianUser?: boolean;
  registrationPlatform?: string;
  emailValidated?: boolean;
  lastEmailValidatedTimestamp?: string;
  passwordSetSecurely?: boolean;
  lastPasswordSetSecurelyTimestamp?: string;
  registrationIdp?: RegistrationIdp;
  googleExternalId?: string;
  appleExternalId?: string;
  facebookExternalId?: string;
}

// https://developer.okta.com/docs/reference/api/users/#password-object
// A password `value` is a write-only property. It is not returned in the response when reading.
// When a user has a valid password, or imported hashed password, or password hook,
// and a response object contains a password credential, then the Password object is a bare object
// without the value property defined(for example, `password: {}`), to indicate that a password value exists.
interface UserCredentialsPassword {
  value?: string;
}

// https://developer.okta.com/docs/reference/api/users/#credentials-object
interface UserCredentials {
  password?: UserCredentialsPassword;
  // Not implemented in our system
  // see https://developer.okta.com/docs/reference/api/users/#recovery-question-object if ever required
  recovery_question?: unknown;
  // Not implemented in our system
  // see https://developer.okta.com/docs/reference/api/users/#provider-object if ever required
  provider: unknown;
}

// https://developer.okta.com/docs/reference/api/users/#user-object
export interface UserResponse {
  id: string;
  status: string;
  profile: Pick<UserProfile, 'email' | 'login' | 'isGuardianUser'>;
  credentials: UserCredentials;
}

// https://developer.okta.com/docs/reference/api/users/#activate-user
// https://developer.okta.com/docs/reference/api/users/#reactivate-user
export interface ActivationTokenResponse {
  activationUrl: string;
  activationToken: string;
}

// Our methods consume the activate_user, reactivate_user, and reset_password
// endpoints and return a token response.
export interface TokenResponse {
  token: string;
}

// https://developer.okta.com/docs/reference/api/users/#request-parameters
export interface UserCreationRequest {
  profile: NonNullable<
    Pick<
      UserProfile,
      'email' | 'login' | 'isGuardianUser' | 'registrationPlatform'
    >
  >;
}

// https://developer.okta.com/docs/reference/api/users/#request-parameters-6
export interface UserUpdateRequest {
  profile?: Partial<UserProfile>;
  credentials?: Partial<UserCredentials>;
}

// https://developer.okta.com/docs/reference/api/users/#response-example-39
export interface ResetPasswordUrlResponse {
  resetPasswordUrl: string;
}

// https://developer.okta.com/docs/reference/api/users/#user-status
export enum Status {
  STAGED = 'STAGED',
  ACTIVE = 'ACTIVE',
  PROVISIONED = 'PROVISIONED',
  RECOVERY = 'RECOVERY',
  PASSWORD_EXPIRED = 'PASSWORD_EXPIRED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  SUSPENDED = 'SUSPENDED',
}
