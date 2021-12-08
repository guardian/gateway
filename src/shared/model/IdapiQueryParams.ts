import { StringifiableRecord } from 'query-string';

/**
 * IdApiQueryParams are query parameters
 * that are expected when sending requests to IdApi
 */
export interface IdApiQueryParams extends StringifiableRecord {
  format?: string;
}
