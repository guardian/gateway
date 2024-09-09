import { Request } from 'express';

import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { logger } from '@/server/lib/serverSideLogger';
import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/trackMetric';
import {
	readEncryptedStateCookie,
	updateEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { PasswordRoutePath, RoutePaths } from '@/shared/model/Routes';
import { PasswordPageTitle } from '@/shared/model/PageTitle';
import {
	getErrorMessage,
	validatePasswordFieldForOkta,
} from '@/server/lib/validatePasswordField';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { getConfiguration } from '@/server/lib/getConfiguration';
import {
	resetPassword as resetPasswordInOkta,
	validateRecoveryToken as validateTokenInOkta,
} from '@/server/lib/okta/api/authentication';
import { OAuthError, OktaError } from '@/server/models/okta/Error';
import { checkTokenInOkta } from '@/server/controllers/checkPasswordToken';
import {
	performAuthorizationCodeFlow,
	scopesForAuthentication,
} from '@/server/lib/okta/oauth';
import { validateEmailAndPasswordSetSecurely } from '@/server/lib/okta/validateEmail';
import { setupJobsUserInOkta } from '@/server/lib/jobs';
import { sendOphanComponentEventFromQueryParamsServer } from '@/server/lib/ophan';
import { ProfileOpenIdClientRedirectUris } from '@/server/lib/okta/openid-connect';
import { decryptOktaRecoveryToken } from '@/server/lib/deeplink/oktaRecoveryToken';
import { changePasswordMetric } from '@/server/models/Metrics';
import { getAppPrefix } from '@/shared/lib/appNameUtils';
import {
	introspect,
	validateIntrospectRemediation,
} from '@/server/lib/okta/idx/introspect';
import { setPasswordAndRedirect } from '@/server/lib/okta/idx/challenge';
import { PasswordFieldErrors } from '@/shared/model/Errors';
import { isBreachedPassword } from '@/server/lib/breachedPasswordCheck';

const { passcodesEnabled } = getConfiguration();

/**
 * Okta IDX API Flow
 *
 * @name oktaIdxApiPasswordHandler
 * @description	Handles the password (re)set for the Okta IDX API flow.
 *
 * Note: Use res.headersSent to check if headers have been sent after calling this function
 * to avoid errors if we respond within this function.
 *
 * @param {Request} req - The request object.
 * @param {ResponseWithRequestState} res - The response object.
 * @param {PasswordPageTitle} pageTitle - The page title.
 * @param {string} password - The password to set.
 * @param {PasswordRoutePath} path - The path of the page.
 *
 * @returns {Promise<void>} - The function does not return anything, or it redirects the user.
 */
const oktaIdxApiPasswordHandler = async ({
	req,
	res,
	pageTitle,
	password,
	path,
}: {
	req: Request;
	res: ResponseWithRequestState;
	pageTitle: PasswordPageTitle;
	password: string;
	path: PasswordRoutePath;
}) => {
	const state = res.locals;

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
			}

			// validate the password field
			validatePasswordFieldForOkta(password);

			// check if the password is breached
			const isBreached = await isBreachedPassword(password);
			if (isBreached) {
				throw new OAuthError({
					error: 'password.common',
					error_description: PasswordFieldErrors.COMMON_PASSWORD,
				});
			}

			// Set the password in Okta, redirect the user to set a global session, and then complete
			// the interaction code flow, eventually redirecting the user back to where they need to go.
			return await setPasswordAndRedirect({
				stateHandle: encryptedState.stateHandle,
				body: {
					passcode: password,
				},
				expressReq: req,
				expressRes: res,
				path,
				request_id: state.requestId,
				ip: req.ip,
			});
		}
	} catch (error) {
		logger.error('Okta IDX setPassword failure', error, {
			request_id: state.requestId,
		});

		if (error instanceof OAuthError) {
			// case for session expired
			if (error.name === 'idx.session.expired') {
				return res.redirect(
					303,
					addQueryParamsToPath(`${path}/expired`, state.queryParams),
				);
			}
		}

		const { globalError, fieldErrors } = getErrorMessage(error);

		// If the recovery token is valid, this call will redirect the client back
		// to the same page, but with an error message. If the token is invalid, the
		// client will be redirected to the /reset-password/expired page and asked
		// to request a new reset password link.
		return await checkTokenInOkta(
			path,
			pageTitle,
			req,
			res,
			globalError,
			fieldErrors,
		);
	}
};

export const setPasswordController = (
	path: PasswordRoutePath,
	pageTitle: PasswordPageTitle,
	successRedirectPath: RoutePaths,
) =>
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const { token: encryptedRecoveryToken } = req.params;
		const { password, firstName, secondName } = req.body;
		const { clientId, useOktaClassic } = res.locals.queryParams;

		// OKTA IDX API FLOW
		// If the user is using the passcode registration flow, we need to handle the password change/creation.
		// If there are specific failures, we fall back to the legacy Okta change password flow.
		if (passcodesEnabled && !useOktaClassic && path === '/welcome') {
			await oktaIdxApiPasswordHandler({
				req,
				res,
				pageTitle,
				password,
				path,
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
			if (!encryptedRecoveryToken) {
				throw new OktaError({ message: 'Okta recovery token missing' });
			}

			validatePasswordFieldForOkta(password);

			// decrypt the recovery token
			const decryptedRecoveryToken = decryptOktaRecoveryToken({
				encryptedToken: encryptedRecoveryToken,
				request_id: res.locals.requestId,
			});
			const [recoveryToken, encryptedRegistrationConsents] =
				decryptedRecoveryToken;

			// We exchange the Okta recovery token for a freshly minted short-lived state
			// token, to complete this change password operation. If the recovery token
			// is invalid, we will show the user the link expired page.
			const { stateToken } = await validateTokenInOkta({
				recoveryToken,
				ip: req.ip,
			});

			if (stateToken) {
				const { sessionToken, _embedded } = await resetPasswordInOkta(
					{
						stateToken,
						newPassword: password,
					},
					req.ip,
				);

				const { id } = _embedded?.user ?? {};
				if (id) {
					await validateEmailAndPasswordSetSecurely(id, req.ip);
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
						await setupJobsUserInOkta(firstName, secondName, id, req.ip);
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

				updateEncryptedStateCookie(req, res, {
					// Update the passwordSetOnWelcomePage only when we are on the welcome page
					...(path === '/welcome' && { passwordSetOnWelcomePage: true }),
					// We want to remove all query params from the cookie after the password is set,
					queryParams: undefined,
				});

				// fire ophan component event if applicable
				if (res.locals.queryParams.componentEventParams) {
					void sendOphanComponentEventFromQueryParamsServer(
						res.locals.queryParams.componentEventParams,
						'SIGN_IN',
						'web',
						res.locals.ophanConfig.consentUUID,
						res.locals.requestId,
					);
				}

				changePasswordMetric(path, 'Success');

				return await performAuthorizationCodeFlow(req, res, {
					sessionToken,
					confirmationPagePath: successRedirectPath,
					closeExistingSession: true,
					prompt: 'none',
					scopes: scopesForAuthentication,
					redirectUri: ProfileOpenIdClientRedirectUris.AUTHENTICATION,
					extraData: {
						// We only set this when we're setting the password on a welcome flow (i.e. when it's a new user)
						isEmailRegistration: path === '/welcome',
						encryptedRegistrationConsents,
						appPrefix: getAppPrefix(encryptedRecoveryToken),
					},
				});
			} else {
				throw new OktaError({ message: 'Okta state token missing' });
			}
		} catch (error) {
			logger.error('Okta change password failure', error, {
				request_id: res.locals.requestId,
			});

			changePasswordMetric(path, 'Failure');

			// see the comment above around the success metrics
			if (clientId === 'jobs' && path === '/welcome') {
				trackMetric('JobsGRSGroupAgree::Failure');
			}

			const { globalError, fieldErrors } = getErrorMessage(error);

			// If the recovery token is valid, this call will redirect the client back
			// to the same page, but with an error message. If the token is invalid, the
			// client will be redirected to the /reset-password/expired page and asked
			// to request a new reset password link.
			await checkTokenInOkta(
				path,
				pageTitle,
				req,
				res,
				globalError,
				fieldErrors,
			);
		}
	});
