import { StringifiableRecord } from 'query-string';

export interface QueryParams extends StringifiableRecord {
  returnUrl: string;
  clientId?: string;
  emailVerified?: boolean;
  csrfError?: boolean;
  // errors as part of the OIDC flow
  error?: string;
  error_description?: string;
}
