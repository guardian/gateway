import { Response } from 'express';
import { QueryParams } from '@/server/models/QueryParams';

export interface ResponseWithLocals extends Response {
  locals: {
    queryParams: QueryParams;
  };
}
