export interface User {
  id: string;
  status: string;
  profile: Profile;
}

export interface Profile {
  email: string;
  login: string;
  isGuardianUser?: boolean;
}

export enum Status {
  STAGED = 'STAGED',
  ACTIVE = 'ACTIVE',
  PROVISIONED = 'PROVISIONED',
  RECOVERY = 'RECOVERY',
  PASSWORD_EXPIRED = 'PASSWORD_EXPIRED',
  PASSWORD_RESET = 'PASSWORD_RESET',
}
