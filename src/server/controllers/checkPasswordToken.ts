import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { Request } from 'express';
import {
	RequestState,
	ResponseWithRequestState,
} from '@/server/models/Express';
import deepmerge from 'deepmerge';
import { getBrowserNameFromUserAgent } from '@/server/lib/getBrowserName';
import {
	readEncryptedStateCookie,
	updateEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { renderer } from '@/server/lib/renderer';
import { logger } from '@/server/lib/serverSideLogger';
import { PasswordRoutePath } from '@/shared/model/Routes';
import { PasswordPageTitle } from '@/shared/model/PageTitle';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { validateRecoveryToken as validateTokenInOkta } from '@/server/lib/okta/api/authentication';
import { trackMetric } from '@/server/lib/trackMetric';
import { ChangePasswordErrors } from '@/shared/model/Errors';
import { FieldError, IsNativeApp } from '@/shared/model/ClientState';
import { PersistableQueryParams } from '@/shared/model/QueryParams';
import { validateReturnUrl } from '@/server/lib/validateUrl';
import { mergeRequestState } from '@/server/lib/requestState';
import { decryptOktaRecoveryToken } from '@/server/lib/deeplink/oktaRecoveryToken';
import { AppName, getAppName, getAppPrefix } from '@/shared/lib/appNameUtils';
import {
	introspect,
	validateIntrospectRemediation,
} from '@/server/lib/okta/idx/introspect';
import { convertExpiresAtToExpiryTimeInMs } from '@/server/lib/okta/idx/shared/convertExpiresAtToExpiryTimeInMs';

const { defaultReturnUri, passcodesEnabled } = getConfiguration();

const handleBackButtonEventOnWelcomePage = (
	path: PasswordRoutePath,
	pageTitle: PasswordPageTitle,
	req: Request,
	res: ResponseWithRequestState,
) => {
	const { email, passwordSetOnWelcomePage } =
		readEncryptedStateCookie(req) ?? {};
	const requestState = mergeRequestState(res.locals, {
		pageData: {
			email,
		},
	});
	if (passwordSetOnWelcomePage) {
		return res.type('html').send(
			renderer(`${path}/complete`, {
				requestState,
				pageTitle,
			}),
		);
	} else {
		return res.type('html').send(
			renderer(`${path}/resend`, {
				requestState,
				pageTitle: `Resend ${pageTitle} Email`,
			}),
		);
	}
};

/**
 * This function decides which return url should take presidence when multi choice are availble
 * If it's passed as a url query parameter, this takes highest precedence, followed by the value in the state cookie.
 * If neither are present the default return url is used
 *
 * @param requestState - this is request state from response.locals
 * @param encryptedStateQueryParams - this is the query parameters from the encryptedState Cookie
 * @returns string
 */
const getReturnUrl = (
	requestState: RequestState,
	encryptedStateQueryParams: PersistableQueryParams,
): string => {
	// check that the returnUrl in requestState is not the defaultReturnUri
	// as this suggests that it would have been modified, such as the native apps
	// setting the return url on email link intercept
	if (requestState.queryParams.returnUrl !== defaultReturnUri) {
		return requestState.queryParams.returnUrl;
	}
	// otherwise check the encrypted state cookie for a returnUrl
	// We always want to validate the returl url value, just in case it's been incorrectly set through developer error
	if (encryptedStateQueryParams.returnUrl) {
		return validateReturnUrl(encryptedStateQueryParams.returnUrl);
	}
	// finally use the defaultReturnUri if all else fails
	return defaultReturnUri;
};

/**
 * Okta IDX API Flow
 *
 * @name oktaIdxApiCheckHandler
 * @description This function is used to check if the user is in the correct state to be able to change their password in the Okta IDX API flow.
 *
 * Note: Use res.headersSent to check if headers have been sent after calling this function
 * to avoid errors if we respond within this function.
 *
 * @param {PasswordRoutePath} path - The path of the page.
 * @param {PasswordPageTitle} pageTitle - The page title.
 * @param {Request} req - The request object.
 * @param {ResponseWithRequestState} res - The response object.
 * @param {ChangePasswordErrors} error - ChangePasswordErrors enum
 * @param {FieldError[]} fieldErrors - FieldError array
 * @returns void - The function does not return anything, or it responds with a page
 */
const oktaIdxApiCheckHandler = async ({
	path,
	pageTitle,
	req,
	res,
	error,
	fieldErrors,
}: {
	path: PasswordRoutePath;
	pageTitle: PasswordPageTitle;
	req: Request;
	res: ResponseWithRequestState;
	error?: ChangePasswordErrors;
	fieldErrors?: FieldError[];
}) => {
	const state = res.locals;
	const { token } = req.params;

	try {
		// Read the encrypted state cookie to get the state handle and email
		const encryptedState = readEncryptedStateCookie(req);
		if (encryptedState?.email && encryptedState.stateHandle) {
			// introspect the stateHandle to make sure it's valid
			const introspectResponse = await introspect(
				{
					stateHandle: encryptedState.stateHandle,
				},
				state.requestId,
				req.ip,
			);

			// validate the introspect response to make sure we're in the correct state
			// if we're creating a new user (/welcome) we should be in the enroll-authenticator remediation
			if (path === '/welcome') {
				validateIntrospectRemediation(
					introspectResponse,
					'enroll-authenticator',
				);
			} else {
				// if we're setting a password, we should be in the reset-authenticator remediation
				validateIntrospectRemediation(
					introspectResponse,
					'reset-authenticator',
				);
			}

			// show the set password page
			const html = renderer(
				`${path}/:token`,
				{
					pageTitle,
					requestState: mergeRequestState(state, {
						pageData: {
							browserName: getBrowserNameFromUserAgent(
								req.header('User-Agent'),
							),
							email: encryptedState.email,
							fieldErrors,
							formError: error,
							token,
							isNativeApp: state.pageData.isNativeApp,
							appName: state.pageData.appName,
							timeUntilTokenExpiry: convertExpiresAtToExpiryTimeInMs(
								introspectResponse.expiresAt,
							),
						},
					}),
				},
				{ token },
			);

			return res.type('html').send(html);
		}
	} catch (error) {
		// if there's an error, log it and fall back to the legacy change password flow
		logger.error(
			'IDX API - check state handle token - checkPasswordToken',
			error,
			{
				request_id: state.requestId,
			},
		);
	}
};

export const checkTokenInOkta = async (
	path: PasswordRoutePath,
	pageTitle: PasswordPageTitle,
	req: Request,
	res: ResponseWithRequestState,
	error?: ChangePasswordErrors,
	fieldErrors?: FieldError[],
) => {
	const state = res.locals;
	const { token } = req.params;

	// OKTA IDX API FLOW
	// If the user is using the passcode flow for registration/reset password,
	// we need to handle the password change/creation.
	// If there are specific failures, we fall back to the legacy Okta change password flow.
	if (
		passcodesEnabled &&
		!res.locals.queryParams.useOktaClassic &&
		(path === '/welcome' || state.queryParams.usePasscodesResetPassword)
	) {
		await oktaIdxApiCheckHandler({
			path,
			pageTitle,
			req,
			res,
			error,
			fieldErrors,
		});
		// don't continue with the legacy flow if we've already responded with the IDX flow
		// res.headersSent is true if we've responded with a page or redirect
		// res.headersSent is false if we haven't responded yet, which is the case where an error occurs
		// and we want to attempt the legacy flow
		if (res.headersSent) {
			return;
		}
	}

	try {
		// check if the token is prefixed with an app prefix
		const prefix = getAppPrefix(token);

		// decrypt the recovery token
		const decryptedRecoveryToken = decryptOktaRecoveryToken({
			encryptedToken: token,
			request_id: state.requestId,
		});
		const [recoveryToken] = decryptedRecoveryToken;

		// Verify that the recovery token is still valid. If invalid, this will
		// return an error and we will show the link expired page.
		const { _embedded } = await validateTokenInOkta({
			recoveryToken,
			ip: req.ip,
		});
		const email = _embedded?.user.profile.login;

		// Add the user's email
		// set at registration to the encrypted state cookie
		updateEncryptedStateCookie(req, res, { email });

		trackMetric('OktaValidatePasswordToken::Success');

		// since we can't pass query parameters through okta emails, we set the encryptedStateCookie
		// as the email was sent to the user containing the query params at that time
		// so we read them here, if the user comes back on the same browser
		const encryptedState = readEncryptedStateCookie(req);

		// get query params from the encrypted state cookie, or set empty object if not found
		const encryptedStateQueryParams =
			encryptedState?.queryParams ?? ({} as PersistableQueryParams);

		// get the returnUrl
		const returnUrl = getReturnUrl(state, encryptedStateQueryParams);

		// get fromURI and appClientId, which are parameters from the Okta SDK
		// and unique to this request
		const { fromURI, appClientId } = state.queryParams;

		// finally generate the queryParams object to merge in with the requestState
		// with the correct returnUrl for this request
		const queryParams = deepmerge<PersistableQueryParams>(
			encryptedStateQueryParams,
			{
				returnUrl,
				fromURI,
				appClientId,
			},
		);

		// attempt to determine if the user is using a native app
		// first checking the pageData, then the prefix, otherwise undefined
		const isNativeApp: IsNativeApp | undefined = (() => {
			if (state.pageData.isNativeApp) {
				return state.pageData.isNativeApp;
			}

			if (prefix) {
				return prefix.startsWith('a') ? 'android' : 'ios';
			}
		})();

		// attempt to determine the app name
		// first checking the pageData, then the prefix, otherwise undefined
		const appName: AppName | undefined = (() => {
			if (state.pageData.appName) {
				return state.pageData.appName;
			}

			if (prefix) {
				return getAppName(prefix);
			}
		})();

		const html = renderer(
			`${path}/:token`,
			{
				pageTitle,
				requestState: mergeRequestState(state, {
					queryParams,
					pageData: {
						browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
						email,
						fieldErrors,
						formError: error,
						token,
						isNativeApp,
						appName,
					},
				}),
			},
			{ token },
		);

		return res.type('html').send(html);
	} catch (error) {
		logger.error('Okta validate password token failure', error, {
			request_id: res.locals.requestId,
		});

		trackMetric('OktaValidatePasswordToken::Failure');

		if (path === '/welcome') {
			handleBackButtonEventOnWelcomePage(path, pageTitle, req, res);
		} else {
			const html = renderer(`${path}/resend`, {
				pageTitle: `Resend ${pageTitle} Email`,
				requestState: res.locals,
			});
			return res.type('html').send(html);
		}
	}
};

export const checkPasswordTokenController = (
	path: PasswordRoutePath,
	pageTitle: PasswordPageTitle,
) =>
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		await checkTokenInOkta(path, pageTitle, req, res);
	});
