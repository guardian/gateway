// Middleware for assigning important parts of the request state to res.locals.
// This should be the only place res.locals is mutated.
// Requires: csurf middlware
import { getGeolocationRegion } from '@/server/lib/getGeolocationRegion';
import { parseExpressQueryParams } from '@/server/lib/queryParams';
import { NextFunction, Response } from 'express';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { tests } from '@/shared/model/experiments/abTests';
import { getABTesting } from '@/server/lib/getABTesting';
import {
	OAuthState,
	RequestState,
	RequestWithTypedQuery,
} from '@/server/models/Express';
import Bowser from 'bowser';
import { logger } from '@/server/lib/serverSideLogger';
import { getApp } from '@/server/lib/okta/api/apps';
import { IsNativeApp } from '@/shared/model/ClientState';
import {
	AppName,
	getAppName,
	getIsNativeAppFromBowser,
	isAppLabel,
} from '@/shared/lib/appNameUtils';
import { readEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import { getPasscodeSendAgainTimer } from '@/server/lib/passcodeSendAgainTimer';

const {
	idapiBaseUrl,
	oauthBaseUrl,
	googleRecaptcha,
	stage,
	githubRunNumber,
	sentryDsn,
} = getConfiguration();

export const requestStateHasOAuthTokens = (
	requestState: RequestState,
): requestState is RequestState & { oauthState: OAuthState } =>
	Boolean(
		requestState.oauthState?.accessToken && requestState.oauthState.idToken,
	);

const getRequestState = async (
	req: RequestWithTypedQuery,
): Promise<RequestState> => {
	const [abTesting, abTestAPI] = getABTesting(req, tests);

	// tracking parameters might be from body too
	const { ref, refViewId } = req.body;

	const queryParams = parseExpressQueryParams(
		req.method,
		{
			...req.query,
			// returnUrl may be a query parameter or referrer header
			returnUrl: req.query.returnUrl || req.get('Referrer'),
		},
		{
			ref,
			refViewId,
		},
	);

	const browser = Bowser.getParser(req.header('user-agent') || 'unknown');

	// TODO: potential for refactoring to no longer use let to assign isNativeApp and appName
	// we also need to know if the flow was initiated by a native app, hence we get the app info from the api
	// and determine this based on the label, whether it contains "android" or "ios"
	// eslint-disable-next-line functional/no-let -- need to assign value based on logic
	let isNativeApp: IsNativeApp;

	// it is also useful to know the app name
	// eslint-disable-next-line functional/no-let -- need to assign value based on logic
	let appName: AppName | undefined;

	try {
		if (queryParams.appClientId) {
			const app = await getApp(queryParams.appClientId);
			const label = app.label.toLowerCase();

			if (isAppLabel(label)) {
				if (label.startsWith('android_')) {
					isNativeApp = 'android';
				} else if (label.startsWith('ios_')) {
					isNativeApp = 'ios';
				} else {
					// if we can't determine the os from the label, use bowser
					// e.g. for the editions app
					isNativeApp = getIsNativeAppFromBowser(browser);
				}

				appName = getAppName(label);
			}
		}
	} catch (error) {
		logger.error('Error getting app info in request state', error);
	}

	const encryptedState = readEncryptedStateCookie(req);

	return {
		queryParams,
		pageData: {
			geolocation: getGeolocationRegion(req),
			returnUrl: queryParams.returnUrl,
			isNativeApp,
			appName,
			hasStateHandle: !!encryptedState?.stateHandle,
			passcodeUsed: !!encryptedState?.passcodeUsed,
			passcodeSendAgainTimer: getPasscodeSendAgainTimer(req),
		},
		globalMessage: {},
		csrf: {
			// This isn't guaranteed to exist as there are some endpoints where
			// we do not have CSRF protection e.g. /unsubscribe-all which is a
			// POST but called by external clients.
			token: req.csrfToken?.(),
		},
		abTesting: abTesting,
		abTestAPI: abTestAPI,
		clientHosts: {
			idapiBaseUrl,
			oauthBaseUrl,
		},
		recaptchaConfig: { recaptchaSiteKey: googleRecaptcha.siteKey },
		ophanConfig: {
			bwid: req.cookies.bwid,
			consentUUID: req.cookies.consentUUID,
			viewId: queryParams.refViewId,
		},
		sentryConfig: {
			build: githubRunNumber,
			stage,
			dsn: sentryDsn,
		},
		browser: browser.getBrowser(),
		requestId: req.get('x-request-id'),
	};
};

export const requestStateMiddleware = async (
	req: RequestWithTypedQuery,
	res: Response,
	next: NextFunction,
) => {
	try {
		const state = await getRequestState(req);

		/* eslint-disable-next-line functional/immutable-data -- This is the only place mutation of res.locals should occur */
		res.locals = state;

		return next();
	} catch (error) {
		logger.error('Error in requestStateMiddleware', error);
		return next(error);
	}
};
