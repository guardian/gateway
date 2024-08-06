import type { Request } from 'express';
import { checkTokenInOkta } from '@/server/controllers/checkPasswordToken';
import { isBreachedPassword } from '@/server/lib/breachedPasswordCheck';
import { decryptOktaRecoveryToken } from '@/server/lib/deeplink/oktaRecoveryToken';
import {
	readEncryptedStateCookie,
	updateEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { setupJobsUserInOkta } from '@/server/lib/jobs';
import {
	resetPassword as resetPasswordInOkta,
	validateRecoveryToken as validateTokenInOkta,
} from '@/server/lib/okta/api/authentication';
import { setPasswordAndRedirect } from '@/server/lib/okta/idx/challenge';
import {
	introspect,
	validateIntrospectRemediation,
} from '@/server/lib/okta/idx/introspect';
import {
	performAuthorizationCodeFlow,
	scopesForAuthentication,
} from '@/server/lib/okta/oauth';
import { ProfileOpenIdClientRedirectUris } from '@/server/lib/okta/openid-connect';
import { validateEmailAndPasswordSetSecurely } from '@/server/lib/okta/validateEmail';
import { sendOphanComponentEventFromQueryParamsServer } from '@/server/lib/ophan';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';
import {
	getErrorMessage,
	validatePasswordFieldForOkta,
} from '@/server/lib/validatePasswordField';
import type { ResponseWithRequestState } from '@/server/models/Express';
import { changePasswordMetric } from '@/server/models/Metrics';
import { OAuthError, OktaError } from '@/server/models/okta/Error';
import { getAppPrefix } from '@/shared/lib/appNameUtils';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { PasswordFieldErrors } from '@/shared/model/Errors';
import type { PasswordPageTitle } from '@/shared/model/PageTitle';
import type { PasswordRoutePath, RoutePaths } from '@/shared/model/Routes';

const { registrationPasscodesEnabled } = getConfiguration();

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
		if (registrationPasscodesEnabled && !useOktaClassic) {
			try {
				// Read the encrypted state cookie to get the state handle and email
				const encryptedState = readEncryptedStateCookie(req);
				if (encryptedState?.email && encryptedState.stateHandle) {
					// introspect the stateHandle to make sure it's valid
					const introspectResponse = await introspect(
						{
							stateHandle: encryptedState.stateHandle,
						},
						res.locals.requestId,
					);

					// check if the remediation array contains a "enroll-authenticator"	object
					// if it does, then we know the stateHandle is valid and we're in the correct state
					validateIntrospectRemediation(
						introspectResponse,
						'enroll-authenticator',
					);

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
						request_id: res.locals.requestId,
					});
				}
			} catch (error) {
				logger.error('Okta IDX setPassword failure', error, {
					request_id: res.locals.requestId,
				});

				if (error instanceof OAuthError) {
					// case for session expired
					if (error.name === 'idx.session.expired') {
						return res.redirect(
							303,
							addQueryParamsToPath('/welcome/expired', res.locals.queryParams),
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
