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
import {
	oktaIdxApiSignInPasscodeController,
	oktaIdxApiSubmitPasscodeController,
} from '../controllers/signInControllers';
import { getConfiguration } from '../lib/getConfiguration';
import { getErrorMessageFromQueryParams } from './signIn';
import { registerPasscodeHandler } from './register';
import handleRecaptcha from '../lib/recaptcha';
import { JOBS_TOS_URI } from '@/shared/model/Configuration';

router.get('/passcode', (req: Request, res: ResponseWithRequestState) => {
	const state = res.locals;
	const encrypedCookieState = readEncryptedStateCookie(req);
	const email = encrypedCookieState?.email;
	if (!encrypedCookieState?.email) {
		return res.send(403);
	}
	if (!encrypedCookieState?.stateHandle) {
		const html = renderer('/passcode/resend', {
			requestState: mergeRequestState(state, {
				pageData: {
					email,
					resendEmailAction: '/register/email-sent/resend',
					changeEmailPage: '/signin',
				},
			}),
			pageTitle: 'Check Your Inbox',
		});
		return res.type('html').send(html);
	}
	try {
		const queryParams = state.queryParams;
		const { error, error_description } = queryParams;

		const possibleError = getErrorMessageFromQueryParams(
			error,
			error_description,
		);

		if (
			encrypedCookieState.passcodeUsed &&
			encrypedCookieState.signInOrRegister === 'SIGNIN'
		) {
			const { baseUri } = getConfiguration();
			const continueLink =
				queryParams.clientId === 'jobs'
					? `https://${baseUri}${addQueryParamsToPath(
							JOBS_TOS_URI,
							queryParams,
						)}`
					: queryParams.fromURI ||
						`https://${baseUri}${addQueryParamsToPath(
							'/signin/refresh',
							queryParams,
						)}`;
			// the "Sign in" link is used to log in or register as a different user, so we add the parameters we need to the link
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
						error: possibleError,
					},
				}),
				pageTitle: 'Sign in',
			});
			return res.type('html').send(html);
		}
		if (
			encrypedCookieState.passcodeUsed &&
			encrypedCookieState.signInOrRegister === 'REGISTER'
		) {
			const html = renderer('/passcode-used-register', {
				requestState: mergeRequestState(state, {
					pageData: {
						email,
					},
					globalMessage: {
						error: possibleError,
					},
				}),
				pageTitle: 'Check Your Inbox',
			});
			return res.type('html').send(html);
		}

		if (!encrypedCookieState.passcodeUsed) {
			const html = renderer('/passcode', {
				requestState: mergeRequestState(state, {
					pageData: {
						email,
						timeUntilTokenExpiry: convertExpiresAtToExpiryTimeInMs(
							encrypedCookieState.stateHandleExpiresAt,
						),
					},
					queryParams: {
						...res.locals.queryParams,
						emailSentSuccess: true,
					},
					globalMessage: {
						error: possibleError,
					},
				}),
				pageTitle: 'Check Your Inbox',
			});
			return res.type('html').send(html);
		}
	} catch (error) {
		logger.error(`${req.method} ${req.originalUrl} Error`, error);
		res.redirect(303, addQueryParamsToPath('/signin', state.queryParams));
	}
});

router.get(
	'/iframed/passcode',
	(req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;
		const encrypedCookieState = readEncryptedStateCookie(req);
		const email = encrypedCookieState?.email;

		if (!encrypedCookieState || !email) {
			return res.send(403);
		}
		try {
			const queryParams = state.queryParams;
			const { error, error_description } = queryParams;

			const possibleError = getErrorMessageFromQueryParams(
				error,
				error_description,
			);

			const html = renderer('/iframed/passcode', {
				requestState: mergeRequestState(state, {
					pageData: {
						email,
						timeUntilTokenExpiry: convertExpiresAtToExpiryTimeInMs(
							encrypedCookieState.stateHandleExpiresAt,
						),
					},
					queryParams: {
						...res.locals.queryParams,
						emailSentSuccess: true,
					},
					globalMessage: {
						error: possibleError,
					},
				}),
				pageTitle: 'Check Your Inbox',
			});
			return res.type('html').send(html);
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl} Error`, error);
			const errorRedirectPath =
				encrypedCookieState.userState === 'NON_EXISTENT' ||
				encrypedCookieState.userState === 'NOT_ACTIVE'
					? '/iframed/register/email'
					: '/iframed/signin';
			res.redirect(
				303,
				addQueryParamsToPath(errorRedirectPath, state.queryParams),
			);
		}
	},
);

router.post(
	'/passcode',
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const encrypedCookieState = readEncryptedStateCookie(req);

		switch (encrypedCookieState?.signInOrRegister) {
			case 'REGISTER':
				return await registerPasscodeHandler(req, res);
			case 'SIGNIN':
			default:
				return await oktaIdxApiSubmitPasscodeController({ req, res });
		}
	}),
);

router.post(
	'/passcode/resend',
	handleRecaptcha,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const encrypedCookieState = readEncryptedStateCookie(req);
		await oktaIdxApiSignInPasscodeController({
			req,
			res,
			confirmationPagePath:
				encrypedCookieState?.signInOrRegister === 'REGISTER'
					? '/welcome/review'
					: undefined,
		});
	}),
);

export default router.router;
