import type { ABTestAPI, Participations } from '@guardian/ab-core';
import type { Jwt } from '@okta/jwt-verifier';
import type Bowser from 'bowser';
import type { Request, Response } from 'express';
import type { OphanConfig } from '@/server/lib/ophan';
import type {
	ClientHosts,
	CsrfState,
	PageData,
	RecaptchaConfig,
	SentryConfig,
} from '@/shared/model/ClientState';
import type { QueryParams } from '@/shared/model/QueryParams';

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
