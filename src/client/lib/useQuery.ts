// A custom hook that builds on useLocation to parse
// the query string for you.

import { parse } from 'query-string';
import { useLocation } from 'react-router-dom';
import { QueryParams } from '@/shared/model/QueryParams';

export function useQuery(): QueryParams {
  return parse(useLocation().search) as unknown as QueryParams;
}
