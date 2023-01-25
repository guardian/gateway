import { StringifiableRecord } from './QueryParams';

/**
 * OktaQueryParams are query parameters
 * that are expected when sending requests to Okta
 */
export interface OktaQueryParams extends StringifiableRecord {
  sendEmail?: boolean;
}
