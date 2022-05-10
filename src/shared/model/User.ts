export default interface User {
  consents: UserConsent[];
  primaryEmailAddress: string;
  statusFields: UserStatusFields;
  privateFields: PrivateFields;
  userGroups: Group[];
}

interface Group {
  path: string;
  packageCode: string;
  joinedDate: string;
}

export interface UserConsent {
  id: string;
  consented: boolean;
}

interface UserStatusFields {
  userEmailValidated: boolean;
}

interface PrivateFields {
  firstName?: string;
  secondName?: string;
}
