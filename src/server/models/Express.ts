import { Response } from 'express';
import { QueryParams } from '@/shared/model/QueryParams';
import { GeoLocation } from '@/shared/model/Geolocation';
import { CsrfState } from '@/shared/model/GlobalState';

export interface Locals {
  queryParams: QueryParams;
  geolocation?: GeoLocation;
  csrf: CsrfState;
}

export interface ResponseWithLocals extends Response {
  locals: Locals;
}
