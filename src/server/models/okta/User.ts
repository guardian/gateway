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

// https://developer.okta.com/docs/reference/api/users/#user-object
export interface UserResponse {
  id: string;
  status: string;
  profile: Pick<UserProfile, 'email' | 'login' | 'isGuardianUser'>;
}

// https://developer.okta.com/docs/reference/api/users/#activate-user
// https://developer.okta.com/docs/reference/api/users/#reactivate-user
export interface ActivationTokenResponse {
  activationUrl: string;
  activationToken: string;
}

// https://developer.okta.com/docs/reference/api/users/#reset-password
export interface ResetPasswordUrlResponse {
  resetPasswordUrl: string;
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
  profile: Partial<UserProfile>;
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
