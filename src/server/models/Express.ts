import { Response } from 'express';
import { QueryParams } from '@/shared/model/QueryParams';
import { CsrfState, PageData } from '@/shared/model/ClientState';
import { parseExpressQueryParams } from '@/server/lib/queryParams';
import { Participations, ABTestAPI } from '@guardian/ab-core';
import { abTestApiForMvtId } from '@/shared/model/experiments/abTests';

interface ABTesting {
  mvtId: number;
  participations: Participations;
  forcedTestVariants: Participations;
}

export interface ServerState {
  globalMessage: {
    error?: string;
    success?: string;
  };
  pageData: PageData;
  queryParams: QueryParams;
  csrf: CsrfState;
  abTesting: ABTesting;
  abTestAPI: ABTestAPI;
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
  abTesting: {
    mvtId: 0,
    participations: {},
    forcedTestVariants: {},
  },
  abTestAPI: abTestApiForMvtId(0),
});
