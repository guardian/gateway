import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { setEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import {
	OphanConfig,
	sendOphanInteractionEventServer,
} from '@/server/lib/ophan';
import { trackMetric } from '@/server/lib/trackMetric';
import { emailSendMetric } from '@/server/models/Metrics';
import {
	addQueryParamsToPath,
	getPersistableQueryParamsWithoutOktaParams,
} from '@/shared/lib/queryParams';
import { logger } from '@/server/lib/serverSideLogger';
import { GenericErrors } from '@/shared/model/Errors';
import { renderer } from '@/server/lib/renderer';
import { isOktaError } from '@/server/lib/okta/api/errors';
import {
	getUser,
	dangerouslyResetPassword,
	activateUser,
	reactivateUser,
	forgotPassword,
	deactivateUser,
} from '@/server/lib/okta/api/users';
import { Status, UserResponse } from '@/server/models/okta/User';
import { OktaError } from '@/server/models/okta/Error';
import { sendCreatePasswordEmail } from '@/email/templates/CreatePassword/sendCreatePasswordEmail';
import { sendResetPasswordEmail } from '@/email/templates/ResetPassword/sendResetPasswordEmail';
import { PasswordRoutePath } from '@/shared/model/Routes';
import { mergeRequestState } from '@/server/lib/requestState';
import dangerouslySetPlaceholderPassword from '@/server/lib/okta/dangerouslySetPlaceholderPassword';
import { encryptOktaRecoveryToken } from '@/server/lib/deeplink/oktaRecoveryToken';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { startIdxFlow } from '@/server/lib/okta/idx/startIdxFlow';
import {
	identify,
	validateIdentifyRemediation,
} from '@/server/lib/okta/idx/identify';
import {
	challenge,
	validateChallengeRemediation,
} from '@/server/lib/okta/idx/challenge';
import { recover } from '@/server/lib/okta/idx/recover';
import { findAuthenticatorId } from '@/server/lib/okta/idx/shared/findAuthenticatorId';

const { passcodesEnabled } = getConfiguration();

const getPath = (req: Request): PasswordRoutePath => {
	const path = req.path;

	if (path.startsWith('/set-password')) {
		return '/set-password';
	}
	return '/reset-password';
};

const sendOphanEvent = (ophanConfig: OphanConfig) => {
	sendOphanInteractionEventServer(
		{
			component: 'email-send',
			value: 'reset-password',
		},
		ophanConfig,
	);
};

const setEncryptedCookieOkta = (
	res: ResponseWithRequestState,
	email: string,
) => {
	setEncryptedStateCookie(res, {
		email,
		// We set queryParams here to allow state to be persisted as part of the registration flow,
		// because we are unable to pass these query parameters via the email activation link in Okta email templates
		queryParams: getPersistableQueryParamsWithoutOktaParams(
			res.locals.queryParams,
		),
	});
};

/**
 * @name changePasswordEmailIdx
 * @description Start the Okta IDX flow to change the user's password
 *
 * NB: This is a WIP and is not fully implemented yet, it should be used behind the `usePasscodesResetPassword` query param flag
 * Current status:
 *   - [x] ACTIVE users
 * 	   - [x] With email + password authenticator
 *     - [ ] With only password authenticator
 *     - [x] With only email authenticator
 *   - [ ] Non-ACTIVE user states
 *
 * @param {Request} req - Express request object
 * @param {ResponseWithRequestState} res - Express response object
 * @param {UserResponse} user - Okta user object
 * @param {string} request_id - Request ID
 * @param {boolean} loopDetectionFlag - Flag to prevent infinite loops
 * @returns {Promise<void | ResponseWithRequestState>}
 */
const changePasswordEmailIdx = async (
	req: Request,
	res: ResponseWithRequestState,
	user: UserResponse,
	request_id?: string,
	loopDetectionFlag: boolean = false,
): Promise<void | ResponseWithRequestState> => {
	// placeholder warning message
	logger.warn('Passcode reset password flow is not fully implemented yet', {
		request_id,
	});

	try {
		// start the IDX flow by calling interact and introspect
		const introspectResponse = await startIdxFlow({
			req,
			res,
			authorizationCodeFlowOptions: {
				// if the user has a password, then we show the reset password page
				// otherwise we show the set password page
				confirmationPagePath: user.credentials.password
					? '/reset-password/complete'
					: '/set-password/complete',
			},
			request_id,
		});

		// check the user's status to determine the correct remediation flow
		switch (user.status) {
			case Status.ACTIVE: {
				/**
				 *
				 * If the user is ACTIVE, then they'll be in one of 3 states:
				 * 1. ACTIVE users - has email + password authenticator (okta idx email verified)
				 * 2. ACTIVE users - has only password authenticator (okta idx email not verified)
				 * 3. ACTIVE users - has only email authenticator (SOCIAL users - no password, or passcode only users (not implemented yet))
				 *
				 * We can identify the users state by calling the IDX API /identify endpoint
				 * and checking the authenticators available
				 *
				 * Depending on their state, we have to perform different steps to reset their password
				 *
				 * This only happens when the "Username enumeration protection" setting is disabled in Okta
				 * under Security > General > User enumeration prevention
				 *
				 * When this is enabled, the IDX API will behave the same for every user,
				 * regardless of their status
				 *
				 * When disabled, the IDX API will return different remediations based on the
				 * user's status, which is helpful for us to determine the correct flow
				 *
				 */

				// call "identify", essentially to start an authentication process
				const identifyResponse = await identify(
					introspectResponse.stateHandle,
					user.profile.email,
					request_id,
					req.ip,
				);

				validateIdentifyRemediation(
					identifyResponse,
					'select-authenticator-authenticate',
				);

				const emailAuthenticatorId = findAuthenticatorId({
					authenticator: 'email',
					response: identifyResponse,
					remediationName: 'select-authenticator-authenticate',
				});

				const passwordAuthenticatorId = findAuthenticatorId({
					authenticator: 'password',
					response: identifyResponse,
					remediationName: 'select-authenticator-authenticate',
				});

				// check the user's authenticators to determine the correct flow
				if (emailAuthenticatorId && passwordAuthenticatorId) {
					// user has both email and password authenticators so:
					// 1. ACTIVE users - has email + password authenticator (okta idx email verified)

					// ACTIVE users with a password *should* be able to user the `recover` flow
					// even if we're not logging the user in, we have to perform these steps
					// in order to ensure we replicate the behaviour the idx flow expects

					// Call the "challenge" endpoint to start the password authentication process
					const challengePasswordResponse = await challenge(
						identifyResponse.stateHandle,
						{
							id: passwordAuthenticatorId,
							methodType: 'password',
						},
						request_id,
						req.ip,
					);

					// validate that the response from the challenge endpoint is a password authenticator
					// and has the "recover" remediation
					validateChallengeRemediation(
						challengePasswordResponse,
						'challenge-authenticator',
						'password',
						true,
					);

					// call the "recover" endpoint to start the password recovery process
					const recoverResponse = await recover(
						challengePasswordResponse.stateHandle,
						request_id,
						req.ip,
					);

					// call the "challenge" endpoint to start the email challenge process
					// and send the user a passcode
					const challengeEmailResponse = await challenge(
						recoverResponse.stateHandle,
						{
							id: emailAuthenticatorId,
							methodType: 'email',
						},
						request_id,
						req.ip,
					);

					// track the success metrics
					trackMetric('OktaIDXResetPasswordSend::Success');
					trackMetric(`OktaIDXResetPasswordSend::${user.status}::Success`);

					// at this point the user will have been sent an email with a passcode

					// set the encrypted state cookie to persist the email and stateHandle
					// which we need to persist during the passcode reset flow
					setEncryptedStateCookie(res, {
						email: user.profile.email,
						stateHandle: challengeEmailResponse.stateHandle,
						stateHandleExpiresAt: challengeEmailResponse.expiresAt,
					});

					// show the email sent page, with passcode instructions
					return res.redirect(
						303,
						addQueryParamsToPath(
							'/reset-password/email-sent',
							res.locals.queryParams,
						),
					);
				} else if (passwordAuthenticatorId && !emailAuthenticatorId) {
					// user has only password authenticator so:
					// 2. ACTIVE users - has only password authenticator (okta idx email not verified)
					// If the user only has a password authenticator, then they failed to use a passcode
					// to verify their account when they created it, and instead set a password using
					// the okta classic reset password flow. In this case, we have to have to enroll
					// the user in the email authenticator to allow them to reset their password.
					// We do this by first setting a placeholder password for the user, then using the
					// identify flow to authenticate the user with the placeholder password. After
					// authenticating the user, the IDX API will tell us that the user needs to enroll
					// in the email authenticator, which we can then use to send them a passcode to verify
					// their account.
					// Once they've verified their account, we use the okta classic api to generate a
					// recover token, and instantly show the set password page to the user for them to
					// set their password.
				} else if (emailAuthenticatorId && !passwordAuthenticatorId) {
					// user has only email authenticator so:
					// 3. ACTIVE users - has only email authenticator (SOCIAL users, no password)

					// If the user only has an email authenticator, that means that they don't have a
					// password set, and most likely are user created via a social provider. In this case,
					// we have to set a placeholder password for this user, then use the standard idx recovery
					// flow to send them a passcode to verify their account and reset their password.

					// if a loop is detected, then throw early to prevent infinite loop
					if (loopDetectionFlag) {
						throw new OktaError({
							message: `Okta changePasswordEmailIdx failed with loop detection flag under ACTIVE users - has only email authenticator (SOCIAL users, no password)`,
						});
					}

					// set a placeholder password for the user
					await dangerouslySetPlaceholderPassword({
						id: user.id,
						ip: req.ip,
					});

					// now that the placeholder password has been set, the user will be in
					// 1. ACTIVE users - has email + password authenticator (okta idx email verified)
					// so we can call this method again to send the user a passcode
					return changePasswordEmailIdx(req, res, user, request_id, true);
				}
			}
			// eslint-disable-next-line no-fallthrough -- allow fallthrough for time being for cases we haven't implemented yet
			default:
				throw new OktaError({
					message: `Okta changePasswordEmailIdx failed with unaccepted Okta user status: ${user.status}`,
				});
		}
	} catch (error) {
		trackMetric('OktaIDXResetPasswordSend::Failure');

		logger.error('Okta changePasswordEmailIdx failed', error, {
			request_id,
		});

		// don't throw the error, so we can fall back to okta classic flow
	}
};

export const sendEmailInOkta = async (
	req: Request,
	res: ResponseWithRequestState,
	loopDetectionFlag: boolean = false,
): Promise<void | ResponseWithRequestState> => {
	const state = res.locals;
	const { email = '' } = req.body;
	const path = getPath(req);
	const {
		queryParams: { appClientId, ref, refViewId, usePasscodesResetPassword },
		requestId: request_id,
	} = state;

	try {
		// get the user object to check user status
		const user = await getUser(email, req.ip);

		if (passcodesEnabled && usePasscodesResetPassword) {
			// try to start the IDX flow to send the user a passcode for reset password
			await changePasswordEmailIdx(req, res, user, request_id);
			// if successful, the user will be redirected to the email sent page
			// so we need to check if the headers have been sent to prevent further processing
			if (res.headersSent) {
				return;
			}
		}

		switch (user.status) {
			case Status.ACTIVE:
				// inner try-catch block to handle specific errors from sendForgotPasswordEmail
				try {
					const token = await forgotPassword(user.id, req.ip);
					if (!token) {
						throw new OktaError({
							message: `Okta user reset password failed: missing reset password token`,
						});
					}
					const emailIsSent = await sendResetPasswordEmail({
						to: user.profile.email,
						resetPasswordToken: await encryptOktaRecoveryToken({
							token,
							appClientId,
							request_id,
						}),
						ref,
						refViewId,
					});
					if (!emailIsSent) {
						trackMetric(emailSendMetric('OktaResetPassword', 'Failure'));
						throw new OktaError({
							message: `Okta user reset password failed: Failed to send email`,
						});
					}
					trackMetric(emailSendMetric('OktaResetPassword', 'Success'));
				} catch (error) {
					// we need to catch an error here to check if the user
					// does not have a password set, for example for social users
					// we still want to send a reset password email for these users
					// so we have to check for the correct error response
					// set an placeholder unknown password and then send the email
					// E0000006 - Access denied exception
					// E0000017 - Reset password failed exception
					if (
						isOktaError(error) &&
						error.status === 403 &&
						(error.code === 'E0000006' || error.code === 'E0000017')
					) {
						// if a loop is detected, then throw early to prevent infinite loop
						if (loopDetectionFlag) {
							throw error;
						}

						// a user *should* only hit this error if no password set
						// but we do a few checks to make sure that it's the case

						// check for user does not have a password set
						// (to make sure we don't override any existing password)
						if (!user.credentials.password) {
							await dangerouslySetPlaceholderPassword({
								id: user.id,
								ip: req.ip,
							});
							// now that the placeholder password has been set, the user behaves like a
							// normal user (provider = OKTA) and we can send the email by calling this method again
							return sendEmailInOkta(req, res, true);
						}
					}

					// otherwise throw the error to the outer catch block
					// as it's not handled in the if statement above
					throw error;
				}
				break;
			case Status.STAGED:
			case Status.DEPROVISIONED:
				{
					// if the user is STAGED or DEPROVISIONED, we need to activate them before we can send them an email
					// this will put them into the PROVISIONED state
					// we will send them a create password email
					try {
						const tokenResponse = await activateUser({
							id: user.id,
							ip: req.ip,
						});
						if (!tokenResponse?.token.length) {
							throw new OktaError({
								message: `Okta user activation failed: missing activation token`,
							});
						}
						const emailIsSent = await sendCreatePasswordEmail({
							to: user.profile.email,
							setPasswordToken: await encryptOktaRecoveryToken({
								token: tokenResponse.token,
								appClientId,
								request_id,
							}),
							ref,
							refViewId,
						});
						if (!emailIsSent) {
							trackMetric(emailSendMetric('OktaCreatePassword', 'Failure'));
							throw new OktaError({
								message: `Okta user activation failed: Failed to send email`,
							});
						}
					} catch (error) {
						// these users are in a special state where they used a passcode to create their account
						// but failed to complete the flow by setting a password, leaving them in an unusual state
						// where they're in the STAGED state but cannot recover normally
						// to remediate these users we have to deactivate them
						// and then reactivate them in order to send them a create password email
						if (error instanceof OktaError && error.code === 'E0000038') {
							// if a loop is detected, then throw early to prevent infinite loop
							if (loopDetectionFlag) {
								throw error;
							}

							trackMetric(
								'PasscodePasswordNotCompleteRemediation-ResetPassword-STAGED-Start',
							);

							// 1. deactivate the user
							try {
								await deactivateUser({
									id: user.id,
									ip: req.ip,
								});
								trackMetric('OktaDeactivateUser::Success');
							} catch (error) {
								trackMetric('OktaDeactivateUser::Failure');
								logger.error(
									'Okta user deactivation failed',
									error instanceof OktaError ? error.message : error,
									{
										request_id,
									},
								);
								throw error;
							}

							trackMetric(
								'PasscodePasswordNotCompleteRemediation-ResetPassword-STAGED-Complete',
							);

							// rerun the sendEmailInOkta function to catch the user in the DEPROVISIONED state
							return sendEmailInOkta(req, res, true);
						}

						logger.error(
							'Okta user activation failed',
							error instanceof OktaError ? error.message : error,
							{
								request_id,
							},
						);

						// otherwise throw the error to the outer catch block
						// as it's not handled in the if statement above
						throw error;
					}
					trackMetric(emailSendMetric('OktaCreatePassword', 'Success'));
				}
				break;
			case Status.PROVISIONED:
				{
					// if the user is PROVISIONED, we need to reactivate them before we can send them an email
					// this will keep them in the PROVISIONED state
					// we will send them a create password email
					try {
						const tokenResponse = await reactivateUser({
							id: user.id,
							ip: req.ip,
						});
						if (!tokenResponse?.token.length) {
							throw new OktaError({
								message: `Okta user reactivation failed: missing re-activation token`,
							});
						}
						const emailIsSent = await sendCreatePasswordEmail({
							to: user.profile.email,
							setPasswordToken: await encryptOktaRecoveryToken({
								token: tokenResponse.token,
								appClientId,
								request_id,
							}),
							ref,
							refViewId,
						});
						if (!emailIsSent) {
							trackMetric(emailSendMetric('OktaCreatePassword', 'Failure'));
							throw new OktaError({
								message: `Okta user reactivation failed: Failed to send email`,
							});
						}
					} catch (error) {
						// these users are in a special state where they used a passcode to create their account
						// but failed to complete the flow by setting a password, leaving them in an unusual state
						// where they're in the PROVISIONED state but cannot recover normally
						// to remediate these users we have to deactivate them
						// and then reactivate them in order to send them a create password email
						if (error instanceof OktaError && error.code === 'E0000038') {
							// if a loop is detected, then throw early to prevent infinite loop
							if (loopDetectionFlag) {
								throw error;
							}

							trackMetric(
								'PasscodePasswordNotCompleteRemediation-ResetPassword-PROVISIONED-Start',
							);

							// 1. deactivate the user
							try {
								await deactivateUser({
									id: user.id,
									ip: req.ip,
								});
								trackMetric('OktaDeactivateUser::Success');
							} catch (error) {
								trackMetric('OktaDeactivateUser::Failure');
								logger.error(
									'Okta user deactivation failed',
									error instanceof OktaError ? error.message : error,
									{
										request_id,
									},
								);
								throw error;
							}

							trackMetric(
								'PasscodePasswordNotCompleteRemediation-ResetPassword-PROVISIONED-Complete',
							);

							// rerun the sendEmailInOkta function to catch the user in the DEPROVISIONED state
							return sendEmailInOkta(req, res, true);
						}

						logger.error(
							'Okta user reactivation failed',
							error instanceof OktaError ? error.message : error,
							{
								request_id,
							},
						);

						// otherwise throw the error to the outer catch block
						// as it's not handled in the if statement above
						throw error;
					}

					trackMetric(emailSendMetric('OktaCreatePassword', 'Success'));
				}
				break;
			case Status.RECOVERY:
			case Status.PASSWORD_EXPIRED:
				{
					// if the user is RECOVERY or PASSWORD_EXPIRED, we use the
					// dangerouslyResetPassword method to put them into the RECOVERY state
					// and send them a reset password email
					const token = await dangerouslyResetPassword(user.id, req.ip);
					if (!token) {
						throw new OktaError({
							message: `Okta user reset password failed: missing reset password token`,
						});
					}
					const emailIsSent = await sendResetPasswordEmail({
						to: user.profile.email,
						resetPasswordToken: await encryptOktaRecoveryToken({
							token,
							appClientId,
							request_id,
						}),
						ref,
						refViewId,
					});
					if (!emailIsSent) {
						trackMetric(emailSendMetric('OktaResetPassword', 'Failure'));
						throw new OktaError({
							message: `Okta user reset password failed: Failed to send email`,
						});
					}
					trackMetric(emailSendMetric('OktaResetPassword', 'Success'));
				}
				break;
			default:
				throw new OktaError({
					message: `Okta reset password failed with unaccepted Okta user status: ${user.status}`,
				});
		}

		setEncryptedCookieOkta(res, email);

		sendOphanEvent(state.ophanConfig);

		return res.redirect(
			303,
			addQueryParamsToPath(`${path}/email-sent`, state.queryParams, {
				emailSentSuccess: true,
			}),
		);
	} catch (error) {
		// handle check for if the user is not found
		// this is a special case because we don't want to send an email
		// but we want to show the email sent page
		// so the reset password page cannot be used for account enumeration
		if (
			isOktaError(error) &&
			error.status === 404 &&
			error.code === 'E0000007'
		) {
			setEncryptedCookieOkta(res, email);

			return res.redirect(
				303,
				addQueryParamsToPath(`${path}/email-sent`, state.queryParams, {
					emailSentSuccess: true,
				}),
			);
		}

		logger.error('Okta send reset password email failed', error, {
			request_id: res.locals.requestId,
		});

		const html = renderer('/reset-password', {
			pageTitle: 'Reset Password',
			requestState: mergeRequestState(state, {
				pageData: {
					formError: GenericErrors.DEFAULT,
				},
			}),
		});

		return res.type('html').send(html);
	}
};
