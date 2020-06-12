import { Response } from 'express';
import { QueryParams } from '@/shared/model/QueryParams';

export interface ResponseWithLocals extends Response {
  locals: {
    queryParams: QueryParams;
  };
}
