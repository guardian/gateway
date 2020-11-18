import { Response } from 'express';
import { QueryParams } from '@/shared/model/QueryParams';
import { CsrfState, PageData } from '@/shared/model/ClientState';
import { parseExpressQueryParams } from '@/server/lib/queryParams';
import { Participations } from '@guardian/ab-core';

export interface ServerState {
  globalMessage: {
    error?: string;
    success?: string;
  };
  pageData: PageData;
  queryParams: QueryParams;
  csrf: CsrfState;
  mvtId: number;
  abTests: Participations;
  forcedTestVariants: Participations;
}

export interface ResponseWithServerStateLocals extends Response {
  locals: ServerState;
}

export const getDefaultServerState = (): ServerState => ({
  queryParams: parseExpressQueryParams('GET', {}),
  csrf: {},
  globalMessage: {},
  pageData: {
    geolocation: 'ROW',
  },
  mvtId: 0,
  abTests: {},
  forcedTestVariants: {},
});
