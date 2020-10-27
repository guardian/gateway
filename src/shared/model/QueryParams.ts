import { StringifiableRecord } from 'query-string';

export interface QueryParams extends StringifiableRecord {
  returnUrl: string;
  clientId?: string;
  emailVerified?: boolean;
}
