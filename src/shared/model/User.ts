export default interface User {
  consents: UserConsent[];
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
