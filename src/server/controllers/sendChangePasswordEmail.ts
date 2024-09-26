import crypto from 'crypto';
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
	isChallengeAnswerCompleteLoginResponse,
	validateChallengeAnswerRemediation,
	validateChallengeRemediation,
} from '@/server/lib/okta/idx/challenge';
import { recover } from '@/server/lib/okta/idx/recover';
import { findAuthenticatorId } from '@/server/lib/okta/idx/shared/findAuthenticatorId';
import { submitPassword } from '@/server/lib/okta/idx/shared/submitPasscode';
import { credentialEnroll } from '@/server/lib/okta/idx/credential';
import {
	resetPassword,
	validateRecoveryToken,
} from '@/server/lib/okta/api/authentication';
import { validateEmailAndPasswordSetSecurely } from '@/server/lib/okta/validateEmail';

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
 * @param {Request} req - Express request object
 * @param {ResponseWithRequestState} res - Express response object
 * @param {UserResponse} user - Okta user object
 * @param {boolean} loopDetectionFlag - Flag to prevent infinite loops
 * @returns {Promise<void | ResponseWithRequestState>}
 */
const changePasswordEmailIdx = async (
	req: Request,
	res: ResponseWithRequestState,
	user: UserResponse,
	loopDetectionFlag: boolean = false,
): Promise<void | ResponseWithRequestState> => {
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
						userState: 'ACTIVE_EMAIL_PASSWORD',
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

					// set a placeholder password for the user
					const placeholderPassword = await dangerouslySetPlaceholderPassword({
						id: user.id,
						ip: req.ip,
						returnPlaceholderPassword: true,
					});

					// call "challenge" to start the password authentication process
					const challengePasswordResponse = await challenge(
						introspectResponse.stateHandle,
						{
							id: passwordAuthenticatorId,
							methodType: 'password',
						},
						req.ip,
					);

					// validate that the response from the challenge endpoint is a password authenticator
					// and has the "recover" remediation
					validateChallengeRemediation(
						challengePasswordResponse,
						'challenge-authenticator',
						'password',
					);

					// call "challenge/answer" to answer the password challenge
					const challengeAnswerResponse = await submitPassword({
						password: placeholderPassword,
						stateHandle: challengePasswordResponse.stateHandle,
						introspectRemediation: 'challenge-authenticator',
						ip: req.ip,
					});

					// check the response from the challenge/answer endpoint
					// if it's a "CompleteLoginResponse" then Okta is in the state
					// where email verification or enrollment is disabled, and a user
					// can authenticate with a password only
					// in this case we want to fall back to the classic reset password flow
					// as this is the only way for these users to reset their password while
					// Okta is in this state
					if (isChallengeAnswerCompleteLoginResponse(challengeAnswerResponse)) {
						// track the metric so we can see if we accidentally hit this case
						trackMetric('OktaIDXEmailVerificationDisabled');
						// throw an error to fall back to the classic reset password flow
						throw new OktaError({
							message: `Okta changePasswordEmailIdx failed as email verification or enrollment is disabled in Okta`,
						});
					}

					// otherwise the response is a "ChallengeAnswerResponse" and we can continue
					// but first we have to check that the response remediation is the "select-authenticator-enroll"
					validateChallengeAnswerRemediation(
						challengeAnswerResponse,
						'select-authenticator-enroll',
					);

					// check for the email authenticator id in the response to make sure that it's the correct enrollment flow
					const challengeAnswerEmailAuthenticatorId = findAuthenticatorId({
						authenticator: 'email',
						response: challengeAnswerResponse,
						remediationName: 'select-authenticator-enroll',
					});

					// if the email authenticator id is not found, then throw an error to fall back to the classic reset password flow
					if (!challengeAnswerEmailAuthenticatorId) {
						throw new OktaError({
							message: `Okta changePasswordEmailIdx failed as email authenticator id is not found in the response`,
						});
					}

					// call the "challenge" endpoint to start the email challenge process
					// and send the user a passcode
					const challengeEmailResponse = await credentialEnroll(
						challengeAnswerResponse.stateHandle,
						{
							id: challengeAnswerEmailAuthenticatorId,
							methodType: 'email',
						},
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
						userState: 'ACTIVE_PASSWORD_ONLY',
					});

					// show the email sent page, with passcode instructions
					return res.redirect(
						303,
						addQueryParamsToPath(
							'/reset-password/email-sent',
							res.locals.queryParams,
						),
					);
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
					return changePasswordEmailIdx(req, res, user, true);
				}
			}
			// eslint-disable-next-line no-fallthrough -- allow fallthrough for time being for cases we haven't implemented yet
			default: {
				// For users in a non-ACTIVE state, we should first get them into one of the ACTIVE states
				// The best way to do this is to first deactivate the user, which works on all user states and puts them into the DEPROVISIONED state
				// Then we can activate the user, which will put them into the PROVISIONED state and return us a recovery token
				// We then use the recovery token to set a placeholder password for the user, which transitions them into the ACTIVE state
				// and then we can call this method again to send the user a passcode as they'll be in one of the ACTIVE states

				// if a loop is detected, then throw early to prevent infinite loop
				if (loopDetectionFlag) {
					throw new OktaError({
						message: `Okta changePasswordEmailIdx failed with loop detection flag under non-ACTIVE user state ${user.status}`,
					});
				}

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
					);
					throw error;
				}

				// 2. activate the user
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

					// 3. use the recovery token to set a placeholder password for the user
					// Validate the token
					const { stateToken } = await validateRecoveryToken({
						recoveryToken: tokenResponse.token,
						ip: req.ip,
					});
					// Check if state token is defined
					if (!stateToken) {
						throw new OktaError({
							message:
								'Okta set placeholder password failed: state token is undefined',
						});
					}
					// Set the placeholder password as a cryptographically secure UUID
					const placeholderPassword = crypto.randomUUID();
					await resetPassword(
						{
							stateToken,
							newPassword: placeholderPassword,
						},
						req.ip,
					);

					// Unset the emailValidated and passwordSetSecurely flags
					await validateEmailAndPasswordSetSecurely({
						id: user.id,
						ip: req.ip,
						flagStatus: false,
					});

					// track the success metrics
					trackMetric(
						`OktaIDXResetPasswordSend::${user.status as Status}::Success`,
					);

					// now that the placeholder password has been set, the user will be in
					// 1. ACTIVE users - has email + password authenticator (okta idx email verified)
					// or 2. ACTIVE users - has only password authenticator (okta idx email not verified)
					// so we can call this method again to send the user a passcode
					// They can't be in the 3. ACTIVE users - has only email authenticator (SOCIAL users, no password)
					// as we've just set a placeholder password for them
					// but we first need to get the updated user object
					const updatedUser = await getUser(user.id, req.ip);
					return changePasswordEmailIdx(req, res, updatedUser, true);
				} catch (error) {
					logger.error(
						'Okta user activation failed',
						error instanceof OktaError ? error.message : error,
					);
					throw error;
				}
			}
		}
	} catch (error) {
		trackMetric('OktaIDXResetPasswordSend::Failure');

		logger.error('Okta changePasswordEmailIdx failed', error);

		// track the failure metrics
		trackMetric(`OktaIDXResetPasswordSend::${user.status as Status}::Failure`);

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
		queryParams: { appClientId, ref, refViewId, useOktaClassic },
	} = state;

	try {
		// get the user object to check user status
		const user = await getUser(email, req.ip);

		if (passcodesEnabled && !useOktaClassic) {
			// try to start the IDX flow to send the user a passcode for reset password
			await changePasswordEmailIdx(req, res, user);
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
			// if we're using passcodes, then show the email sent page with OTP input
			// even if the user doesn't exist
			if (passcodesEnabled && !useOktaClassic) {
				// set the encrypted state cookie to persist the email and stateHandle
				// which we need to persist during the passcode reset flow
				setEncryptedStateCookie(res, {
					email,
					stateHandle: `02.id.${crypto.randomBytes(30).toString('base64')}`, // generate a 40 character random string to use in the 46 character stateHandle
					// 30 minutes in the future
					stateHandleExpiresAt: new Date(
						Date.now() + 30 * 60 * 1000,
					).toISOString(),
					userState: 'NON_EXISTENT', // set the user state to non-existent, so we can handle this case if the user attempts to submit the passcode
				});

				// track the success metrics
				trackMetric(`OktaIDXResetPasswordSend::NON_EXISTENT::Success`);

				// show the email sent page, with passcode instructions
				return res.redirect(
					303,
					addQueryParamsToPath(
						'/reset-password/email-sent',
						res.locals.queryParams,
					),
				);
			}

			setEncryptedCookieOkta(res, email);

			return res.redirect(
				303,
				addQueryParamsToPath(`${path}/email-sent`, state.queryParams, {
					emailSentSuccess: true,
				}),
			);
		}

		logger.error('Okta send reset password email failed', error);

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
