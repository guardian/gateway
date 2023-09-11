import { Request } from 'express';

import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { getBrowserNameFromUserAgent } from '@/server/lib/getBrowserName';
import { logger } from '@/server/lib/serverSideLogger';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import {
	validate as validateToken,
	change as changePassword,
} from '@/server/lib/idapi/changePassword';
import { setIDAPICookies } from '@/server/lib/idapi/IDAPICookies';
import { trackMetric } from '@/server/lib/trackMetric';
import { updateEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import { ApiError } from '@/server/models/Error';
import { PasswordRoutePath, RoutePaths } from '@/shared/model/Routes';
import { PasswordPageTitle } from '@/shared/model/PageTitle';
import {
	getErrorMessage,
	validatePasswordField,
	validatePasswordFieldForOkta,
} from '@/server/lib/validatePasswordField';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { getConfiguration } from '@/server/lib/getConfiguration';
import {
	resetPassword as resetPasswordInOkta,
	validateRecoveryToken as validateTokenInOkta,
} from '@/server/lib/okta/api/authentication';
import { OktaError } from '@/server/models/okta/Error';
import { checkTokenInOkta } from '@/server/controllers/checkPasswordToken';
import {
	performAuthorizationCodeFlow,
	scopesForAuthentication,
} from '@/server/lib/okta/oauth';
import { validateEmailAndPasswordSetSecurely } from '@/server/lib/okta/validateEmail';
import { setupJobsUserInIDAPI, setupJobsUserInOkta } from '../lib/jobs';
import { sendOphanComponentEventFromQueryParamsServer } from '../lib/ophan';
import { clearOktaCookies } from '../routes/signOut';
import { mergeRequestState } from '@/server/lib/requestState';
import { ProfileOpenIdClientRedirectUris } from '@/server/lib/okta/openid-connect';

const { okta } = getConfiguration();

const changePasswordInIDAPI = async (
	path: PasswordRoutePath,
	pageTitle: PasswordPageTitle,
	req: Request,
	res: ResponseWithRequestState,
	successRedirectPath: RoutePaths,
) => {
	const { token } = req.params;
	const { clientId } = req.query;
	const { password, firstName, secondName } = req.body;

	// eslint-disable-next-line functional/no-let
	let requestState = mergeRequestState(res.locals, {
		pageData: {
			browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
			token,
		},
	});

	try {
		validatePasswordField(password);

		const cookies = await changePassword(
			password,
			token,
			req.ip,
			res.locals.requestId,
		);

		if (cookies) {
			// because we are changing the password using idapi, and a new okta
			// session will not be created, so we will need to clear the okta
			// cookies to keep the sessions in sync
			clearOktaCookies(res);
			setIDAPICookies(res, cookies);
		}

		// if the user navigates back to the welcome page after they have set a password, this
		// ensures we show them a custom error page rather than the link expired page
		if (path === '/welcome') {
			updateEncryptedStateCookie(req, res, {
				passwordSetOnWelcomePage: true,
			});
		}

		// When a jobs user is registering, we add them to the GRS group and set their name
		if (clientId === 'jobs' && path === '/welcome') {
			const SC_GU_U = cookies?.values.find(({ key }) => key === 'SC_GU_U');
			if (SC_GU_U) {
				await setupJobsUserInIDAPI(
					firstName,
					secondName,
					req.ip,
					SC_GU_U.value,
					res.locals.requestId,
				);
				trackMetric('JobsGRSGroupAgree::Success');
			}
		}

		// we need to track both of these cloudwatch metrics as two
		// separate metrics at this point as the changePassword endpoint
		// does two things
		// a) account verification
		// b) change password
		// since these could happen at different points in time, it's best
		// to keep them as two separate metrics
		trackMetric('AccountVerification::Success');
		trackMetric('UpdatePassword::Success');

		return res.redirect(
			303,
			addQueryParamsToPath(successRedirectPath, requestState.queryParams),
		);
	} catch (error) {
		const { message, status, field } =
			error instanceof ApiError ? error : new ApiError();

		logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
			request_id: res.locals.requestId,
		});

		// see the comment above around the success metrics
		if (clientId === 'jobs' && path === '/welcome') {
			trackMetric('JobsGRSGroupAgree::Failure');
		}
		trackMetric('AccountVerification::Failure');
		trackMetric('UpdatePassword::Failure');

		// we unfortunately need this inner try catch block to catch
		// errors from the `validateToken` method were it to fail
		try {
			const { email, timeUntilTokenExpiry } = await validateToken(
				token,
				req.ip,
				res.locals.requestId,
			);

			if (field) {
				requestState = mergeRequestState(requestState, {
					pageData: {
						email,
						timeUntilTokenExpiry,
						fieldErrors: [
							{
								field,
								message,
							},
						],
					},
				});
			} else {
				requestState = mergeRequestState(requestState, {
					pageData: {
						email,
						timeUntilTokenExpiry,
						formError: message,
					},
				});
			}

			const html = renderer(
				`${path}/:token`,
				{ requestState, pageTitle },
				{ token },
			);
			return res.status(status).type('html').send(html);
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: res.locals.requestId,
			});
			// if theres an error with the token validation, we have to take them back
			// to the resend page
			return res.type('html').send(
				renderer(`${path}/resend`, {
					requestState,
					pageTitle: `Resend ${pageTitle} Email`,
				}),
			);
		}
	}
};

const changePasswordInOkta = async (
	path: PasswordRoutePath,
	pageTitle: PasswordPageTitle,
	req: Request,
	res: ResponseWithRequestState,
	successRedirectPath: RoutePaths,
) => {
	const recoveryToken = req.params?.token;
	const { password, firstName, secondName } = req.body;
	const { clientId } = req.query;

	try {
		if (!recoveryToken) {
			throw new OktaError({ message: 'Okta recovery token missing' });
		}

		validatePasswordFieldForOkta(password);

		// We exhange the Okta recovery token for a freshly minted short-lived state
		// token, to complete this change password operation. If the recovery token
		// is invalid, we will show the user the link expired page.
		const { stateToken } = await validateTokenInOkta({
			recoveryToken,
		});

		if (stateToken) {
			const { sessionToken, _embedded } = await resetPasswordInOkta({
				stateToken,
				newPassword: password,
			});

			const { id } = _embedded?.user ?? {};
			if (id) {
				await validateEmailAndPasswordSetSecurely(id);
			} else {
				logger.error(
					'Failed to set validation flags in Okta as there was no id',
					undefined,
					{
						request_id: res.locals.requestId,
					},
				);
			}

			// When a jobs user is registering, we add them to the GRS group and set their name
			if (clientId === 'jobs' && path === '/welcome') {
				if (id) {
					await setupJobsUserInOkta(firstName, secondName, id);
					trackMetric('JobsGRSGroupAgree::Success');
				} else {
					logger.error(
						'Failed to set jobs user name and field in Okta as there was no id',
						undefined,
						{
							request_id: res.locals.requestId,
						},
					);
				}
			}

			trackMetric('OktaUpdatePassword::Success');

			updateEncryptedStateCookie(req, res, {
				// Update the passwordSetOnWelcomePage only when we are on the welcome page
				...(path === '/welcome' && { passwordSetOnWelcomePage: true }),
				// We want to remove all query params from the cookie after the password is set,
				queryParams: undefined,
			});

			// fire ophan component event if applicable
			if (res.locals.queryParams.componentEventParams) {
				sendOphanComponentEventFromQueryParamsServer(
					res.locals.queryParams.componentEventParams,
					'SIGN_IN',
					'web',
					res.locals.ophanConfig.consentUUID,
					res.locals.requestId,
				);
			}

			return await performAuthorizationCodeFlow(req, res, {
				sessionToken,
				confirmationPagePath: successRedirectPath,
				closeExistingSession: true,
				prompt: 'none',
				scopes: scopesForAuthentication,
				redirectUri: ProfileOpenIdClientRedirectUris.AUTHENTICATION,
			});
		} else {
			throw new OktaError({ message: 'Okta state token missing' });
		}
	} catch (error) {
		logger.error('Okta change password failure', error, {
			request_id: res.locals.requestId,
		});

		// see the comment above around the success metrics
		if (clientId === 'jobs' && path === '/welcome') {
			trackMetric('JobsGRSGroupAgree::Failure');
		}

		trackMetric('OktaUpdatePassword::Failure');

		const { globalError, fieldErrors } = getErrorMessage(error);

		// If the recovery token is valid, this call will redirect the client back
		// to the same page, but with an error message. If the token is invalid, the
		// client will be redirected to the /reset-password/expired page and asked
		// to request a new reset password link.
		await checkTokenInOkta(path, pageTitle, req, res, globalError, fieldErrors);
	}
};

export const setPasswordController = (
	path: PasswordRoutePath,
	pageTitle: PasswordPageTitle,
	successRedirectPath: RoutePaths,
) =>
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const { useIdapi } = res.locals.queryParams;
		if (okta.enabled && !useIdapi) {
			await changePasswordInOkta(
				path,
				pageTitle,
				req,
				res,
				successRedirectPath,
			);
		} else {
			await changePasswordInIDAPI(
				path,
				pageTitle,
				req,
				res,
				successRedirectPath,
			);
		}
	});
