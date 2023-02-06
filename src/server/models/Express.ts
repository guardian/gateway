import { Request, Response } from 'express';
import { QueryParams } from '@/shared/model/QueryParams';
import {
  ClientHosts,
  CsrfState,
  PageData,
  RecaptchaConfig,
  SentryConfig,
} from '@/shared/model/ClientState';
import { Participations, ABTestAPI } from '@guardian/ab-core';
import { OphanConfig } from '@/server/lib/ophan';
import Bowser from 'bowser';

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
  recaptchaConfig: RecaptchaConfig;
  ophanConfig: OphanConfig;
  sentryConfig: SentryConfig;
  browser: Bowser.Parser.Details;
  requestId?: string;
}

export type ResponseWithRequestState = Response<unknown, RequestState>;

export interface RequestWithTypedQuery extends Request {
  query: Record<keyof QueryParams, string | undefined>;
}
