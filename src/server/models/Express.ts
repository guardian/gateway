import { Response } from 'express';
import { QueryParams } from '@/shared/model/QueryParams';
import { ClientHosts, CsrfState, PageData } from '@/shared/model/ClientState';
import { parseExpressQueryParams } from '@/server/lib/queryParams';
import { Participations, ABTestAPI } from '@guardian/ab-core';
import { abTestApiForMvtId } from '@/shared/model/experiments/abTests';
import { getConfiguration } from '@/server/lib/configuration';

const { idapiBaseUrl } = getConfiguration();

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
  clientHosts: ClientHosts;
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
  clientHosts: {
    idapiBaseUrl,
  },
});
