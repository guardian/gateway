export default interface User {
  id: string;
  consents?: UserConsent[];
  primaryEmailAddress: string;
  statusFields: UserStatusFields;
}

export interface UserConsent {
  id: string;
  consented: boolean;
}

export interface UserStatusFields {
  userEmailValidated: boolean;
}
