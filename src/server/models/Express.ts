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
import { Jwt } from '@okta/jwt-verifier';

export interface ABTesting {
	mvtId: number;
	participations: Participations;
	forcedTestVariants: Participations;
}

// We only set oauthState in the loginMiddlewareOAuth middleware
// when we're absolutely sure that not only do the tokens exist,
// but they're also valid, so we can safely assume that they're
// always present in this interface. This prevents unnecessary
// hedging about the validity of this object elsewhere.
export interface OAuthState {
	accessToken: Jwt;
	idToken: Jwt;
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
	oauthState?: OAuthState;
	requestId?: string;
}

export type ResponseWithRequestState = Response<unknown, RequestState>;

export interface RequestWithTypedQuery extends Request {
	query: Record<keyof QueryParams, string | undefined>;
}
