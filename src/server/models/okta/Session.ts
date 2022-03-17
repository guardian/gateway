// Session object definition https://developer.okta.com/docs/reference/api/sessions/#session-properties

export interface SessionResponse {
  id: string;
  login: string;
  userId: string;
  expiresAt: string;
  status: 'ACTIVE' | 'MFA_REQUIRED' | 'MFA_ENROLL';
  lastPasswordVerification: string;
  lastFactorVerification: string;
  // amr: string;
  // idp: string;
  mfaActive: boolean;
}
