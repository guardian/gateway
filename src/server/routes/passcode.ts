import { Request } from 'express';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { renderer } from '../lib/renderer';
import { readEncryptedStateCookie } from '../lib/encryptedStateCookie';
import { mergeRequestState } from '../lib/requestState';
import { convertExpiresAtToExpiryTimeInMs } from '../lib/okta/idx/shared/convertExpiresAtToExpiryTimeInMs';
import { logger } from '../lib/serverSideLogger';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { handleAsyncErrors } from '../lib/expressWrappers';
import { oktaIdxApiSubmitPasscodeController } from '../controllers/signInControllers';
import { getConfiguration } from '../lib/getConfiguration';
import { getErrorMessageFromQueryParams } from './signIn';
import { redirectIfLoggedIn } from '../lib/middleware/redirectIfLoggedIn';
import { registerPasscodeHandler } from './register';

router.get('/passcode', (req: Request, res: ResponseWithRequestState) => {
	const state = res.locals;
	const encrypedCookieState = readEncryptedStateCookie(req);
	if (encrypedCookieState?.email && encrypedCookieState.stateHandle) {
		try {
			const email = encrypedCookieState.email;
			if (encrypedCookieState.passcodeUsed) {
				switch (encrypedCookieState.signInOrRegister) {
					case 'SIGNIN': {
						const { baseUri } = getConfiguration();
						const queryParams = state.queryParams;
						const { error, error_description } = queryParams;
						const continueLink =
							queryParams.clientId === 'jobs'
								? `https://${baseUri}${addQueryParamsToPath(
										'/agree/GRS',
										queryParams,
									)}`
								: queryParams.fromURI ||
									`https://${baseUri}${addQueryParamsToPath(
										'/signin/refresh',
										queryParams,
									)}`;
						// the "Sign in" link is used to log in as a different user, so we add the parameters we need to the link
						const signInLink = encodeURIComponent(
							`https://${baseUri}${addQueryParamsToPath('/signin', state.queryParams)}`,
						);

						// the sign out link is what's the "Sign in with a different email" link is pointing to
						// it signs the user out first, and then redirects to the sign in page with the required parameters
						const signOutLink = addQueryParamsToPath('/signout', {
							returnUrl: signInLink,
						});
						const html = renderer('/signed-in-as', {
							requestState: mergeRequestState(state, {
								pageData: {
									email,
									continueLink,
									signOutLink,
								},
								globalMessage: {
									error: getErrorMessageFromQueryParams(
										error,
										error_description,
									),
								},
							}),
							pageTitle: 'Sign in',
						});
						res.type('html').send(html);
						break;
					}
					case 'REGISTER': {
						const html = renderer('/passcode-used-register', {
							requestState: mergeRequestState(state, {
								pageData: {
									email,
								},
							}),
							pageTitle: 'Check Your Inbox',
						});
						res.type('html').send(html);
					}
				}
			} else {
				const html = renderer('/passcode', {
					requestState: mergeRequestState(state, {
						pageData: {
							email,
							timeUntilTokenExpiry: convertExpiresAtToExpiryTimeInMs(
								encrypedCookieState.stateHandleExpiresAt,
							),
						},
					}),
					pageTitle: 'Check Your Inbox',
				});
				res.type('html').send(html);
			}
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl} Error`, error);
			res.redirect(303, addQueryParamsToPath('/signin', state.queryParams));
		}
	} else {
		res.send(403);
	}
});

router.post(
	'/passcode',
	redirectIfLoggedIn,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const encrypedCookieState = readEncryptedStateCookie(req);
		switch (encrypedCookieState?.signInOrRegister) {
			case 'SIGNIN':
			default:
				return await oktaIdxApiSubmitPasscodeController({ req, res });
			case 'REGISTER':
				return await registerPasscodeHandler(req, res);
		}
	}),
);

export default router.router;
