import { Response } from 'express';
import { QueryParams } from '@/shared/model/QueryParams';
import { CsrfState, PageData } from '@/shared/model/ClientState';
import { parseExpressQueryParams } from '@/server/lib/queryParams';

export interface ServerState {
  globalMessage: {
    error?: string;
    success?: string;
  };
  pageData: PageData;
  queryParams: QueryParams;
  csrf: CsrfState;
}

export interface ResponseWithServerStateLocals extends Response {
  locals: ServerState;
}

export const defaultServerState: ServerState = {
  queryParams: parseExpressQueryParams('GET', {}),
  csrf: {},
  globalMessage: {},
  pageData: {
    geolocation: 'ROW',
  },
};
