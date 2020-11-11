import { Response } from 'express';
import { QueryParams } from '@/shared/model/QueryParams';
import { GeoLocation } from '@/shared/model/Geolocation';
import { CsrfState, PageData } from '@/shared/model/GlobalState';
import { FieldError } from '@/server/routes/changePassword';
import { parseExpressQueryParams } from '@/server/lib/queryParams';

export interface Locals {
  error?: string;
  success?: string;
  emailProvider?: string;
  email?: string;
  fieldErrors?: Array<FieldError>;
  pageData?: PageData;
  signInPageUrl?: string;
  queryParams: QueryParams;
  geolocation?: GeoLocation;
  csrf: CsrfState;
}

export interface ResponseWithLocals extends Response {
  locals: Locals;
}

export const defaultLocals: Locals = {
  queryParams: parseExpressQueryParams('GET', {}),
  geolocation: 'ROW',
  csrf: {},
};
