export default interface User {
  consents: UserConsent[];
}

export interface UserConsent {
  id: string;
  consented: boolean;
}
