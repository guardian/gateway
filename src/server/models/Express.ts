import { Response } from 'express';
import { QueryParams } from '@/shared/model/QueryParams';

export type GeoLocation = 'GB' | 'US' | 'AU' | 'ROW';

export interface Locals {
  queryParams: QueryParams;
  geolocation?: GeoLocation;
}

export interface ResponseWithLocals extends Response {
  locals: Locals;
}
