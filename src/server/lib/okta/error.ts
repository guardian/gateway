// https://developer.okta.com/docs/reference/error-codes/
export interface OktaError {
  errorCode: string;
  errorSummary: string;
  errorLink: string;
  errorId: string;
  errorCauses: [string?];
}

export interface FetchOktaError {
  status: number;
  statusText: string;
  oktaError: OktaError;
}
