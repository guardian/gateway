import { PersistableQueryParams } from './QueryParams';

/**
 * IdApiQueryParams are query parameters
 * that are expected when sending requests to IdApi
 */
export interface IdApiQueryParams extends Partial<PersistableQueryParams> {
  format?: string;
}
