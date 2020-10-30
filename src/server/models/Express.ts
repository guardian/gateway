import { Response } from 'express';
import { QueryParams } from '@/shared/model/QueryParams';
import { GeoLocation } from '@/shared/model/Geolocation';

export interface Locals {
  queryParams: QueryParams;
  geolocation?: GeoLocation;
  csrfToken?: string;
}

export interface ResponseWithLocals extends Response {
  locals: Locals;
}
