import { Response } from 'express';
import { QueryParams } from '@/shared/model/QueryParams';
import { ClientHosts, CsrfState, PageData } from '@/shared/model/ClientState';
import { Participations, ABTestAPI } from '@guardian/ab-core';

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
