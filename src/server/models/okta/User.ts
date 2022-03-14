// https://developer.okta.com/docs/reference/api/users/#user-object
export interface UserResponse {
  id: string;
  status: string;
  profile: {
    email: string;
    login: string;
    isGuardianUser?: boolean;
  };
}

export interface UserCreationRequest {
  profile: {
    email: string;
    login: string;
    isGuardianUser: boolean;
    registrationPlatform: string;
  };
}

export interface UserUpdateRequest {
  profile: {
    email?: string;
    login?: string;
    emailValidated?: boolean;
    lastEmailValidatedTimestamp?: Date;
    passwordSetSecurely?: boolean;
    lastPasswordSetSecurelyTimestamp?: Date;
    registrationIdp?: RegistrationIdp;
    googleExternalId?: string;
    appleExternalId?: string;
    facebookExternalId?: string;
  };
}

type RegistrationIdp = 'google' | 'apple' | 'facebook';

// https://developer.okta.com/docs/reference/api/users/#user-status
export enum Status {
  STAGED = 'STAGED',
  ACTIVE = 'ACTIVE',
  PROVISIONED = 'PROVISIONED',
  RECOVERY = 'RECOVERY',
  PASSWORD_EXPIRED = 'PASSWORD_EXPIRED',
  PASSWORD_RESET = 'PASSWORD_RESET',
}
