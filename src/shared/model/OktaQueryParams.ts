import { StringifiableRecord } from 'query-string';

/**
 * Okta are query parameters
 * that are expected when sending requests to Okta
 */
export interface OktaQueryParams extends StringifiableRecord {
  sendEmail?: boolean;
}
