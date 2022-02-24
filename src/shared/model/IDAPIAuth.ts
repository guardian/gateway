export enum IDAPIAuthStatus {
  RECENT = 'signedInRecently',
  NOT_RECENT = 'signedInNotRecently',
  SIGNED_OUT = 'notSignedIn',
}

export interface IDAPIAuthRedirect {
  status: IDAPIAuthStatus;
  emailValidated: boolean;
  redirect?: {
    url: string;
  };
}

export interface IdapiCookie {
  key: string;
  value: string;
  sessionCookie?: boolean;
}

export interface IdapiCookies {
  values: Array<IdapiCookie>;
  expiresAt: string;
}
