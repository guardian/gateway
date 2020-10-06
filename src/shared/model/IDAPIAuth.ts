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
