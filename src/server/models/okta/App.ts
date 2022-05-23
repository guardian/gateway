// https://developer.okta.com/docs/reference/api/apps/#application-properties
export interface AppResponse {
  id: string;
  label: string;
  settings: {
    oauthClient: {
      redirect_uris: string[];
    };
  };
}
