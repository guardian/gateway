import { Response } from 'express';
import { QueryParams } from '@/shared/model/QueryParams';
import { CsrfState, PageData } from '@/shared/model/GlobalState';
import { parseExpressQueryParams } from '@/server/lib/queryParams';

export interface Locals {
  globalMessage: {
    error?: string;
    success?: string;
  };
  pageData: PageData;
  queryParams: QueryParams;
  csrf: CsrfState;
}

export interface ResponseWithLocals extends Response {
  locals: Locals;
}

export const defaultLocals: Locals = {
  queryParams: parseExpressQueryParams('GET', {}),
  csrf: {},
  globalMessage: {},
  pageData: {
    geolocation: 'ROW',
  },
};
