import { Response } from 'express';
import { QueryParams } from '@/shared/model/QueryParams';
import { CsrfState, PageData } from '@/shared/model/ClientState';
import { parseExpressQueryParams } from '@/server/lib/queryParams';
import { Participations, ABTestAPI } from '@guardian/ab-core';
import { abTestApiForMvtId } from '@/shared/model/experiments/abTests';

export interface ABTesting {
  mvtId: number;
  participations: Participations;
  forcedTestVariants: Participations;
}

export interface RequestState {
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

export interface ResponseWithRequestState extends Response {
  locals: RequestState;
}

export const getDefaultRequestState = (): RequestState => ({
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
